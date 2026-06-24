#!/usr/bin/env python3
"""
Tessia — Cliente de voz con WebRTC VAD
Di "Tessia" para activar. El sistema detecta automáticamente cuándo empiezas
y terminas de hablar usando WebRTC VAD en lugar de umbral de amplitud.
"""

import os
import sys
import json
import wave
import tempfile
import subprocess
import urllib.request
import zipfile
import collections
from typing import List, Optional, Deque

import numpy as np
import sounddevice as sd
import requests
import webrtcvad
from vosk import Model, KaldiRecognizer, SetLogLevel
from faster_whisper import WhisperModel
from dotenv import dotenv_values

SetLogLevel(-1)

# ── Config ─────────────────────────────────────────────────────────────────────
_env = dotenv_values(os.path.join(os.path.dirname(__file__), '..', '.env'))
DEBUG = os.environ.get('TESSIA_DEBUG', '').lower() in ('1', 'true')

API_URL         = f"http://localhost:{_env.get('PORT', '3000')}/api"
SAMPLE_RATE     = 16000

# WebRTC VAD trabaja con frames de exactamente 10, 20 o 30 ms
FRAME_MS        = 30
FRAME_SAMPLES   = SAMPLE_RATE * FRAME_MS // 1000   # 480 muestras por frame
FRAME_BYTES     = FRAME_SAMPLES * 2                # PCM 16-bit = 2 bytes/muestra

# Modo VAD: 0=más permisivo, 3=más agresivo (filtra más ruido de fondo)
VAD_MODE        = int(_env.get('VAD_MODE', '3'))

SIL_SECS        = float(_env.get('SILENCE_DURATION', '1.5'))
MAX_SECS        = float(_env.get('MAX_RECORD_SECS', '15.0'))
CONV_TIMEOUT    = float(_env.get('CONVERSATION_TIMEOUT', '30.0'))
PREROLL_SECS    = 0.4   # audio previo al inicio del habla para no perder fonemas iniciales

WAKE_WORDS  = {'tessia', 'tesia', 'te sia', 'tecia', 'te ssia', 'tres sia', 'decía', 'te decía'}
EXIT_WORDS  = {'bye', 'adiós', 'adios', 'hasta luego', 'salir', 'cerrar', 'chao'}

ELEVENLABS_API_KEY  = _env.get('ELEVENLABS_API_KEY', '')
ELEVENLABS_VOICE_ID = _env.get('ELEVENLABS_VOICE_ID', 'EXAVITQu4vr4xnSDxMaL')
KOKORO_PY_VOICE     = _env.get('KOKORO_PY_VOICE', 'ef_dora')
KOKORO_PY_SPEED     = float(_env.get('KOKORO_SPEED', '1.0'))
WHISPER_MODEL       = _env.get('WHISPER_MODEL', 'small')

MODEL_DIR = os.path.join(os.path.dirname(__file__), 'models', 'vosk-model-small-es-0.42')
MODEL_URL = 'https://alphacephei.com/vosk/models/vosk-model-small-es-0.42.zip'

_SOX_AVAILABLE            = subprocess.run(['which', 'sox'], capture_output=True).returncode == 0
_kokoro_pipeline          = None
_whisper_model            = None
_elevenlabs_quota_exceeded = False
_vad                      = webrtcvad.Vad(VAD_MODE)


# ── Modelos ────────────────────────────────────────────────────────────────────
def _get_whisper():
    global _whisper_model
    if _whisper_model is None:
        print(f'Cargando Whisper "{WHISPER_MODEL}" (primera vez puede tardar)...')
        _whisper_model = WhisperModel(WHISPER_MODEL, device='cpu', compute_type='int8')
        print('Whisper listo')
    return _whisper_model


def transcribe_local(wav_path: str) -> str:
    model = _get_whisper()
    segments, _ = model.transcribe(
        wav_path,
        language='es',
        beam_size=5,
        vad_filter=True,
        vad_parameters={'min_silence_duration_ms': 300},
    )
    return ' '.join(seg.text.strip() for seg in segments).strip()


def _get_kokoro():
    global _kokoro_pipeline
    if _kokoro_pipeline is None:
        from kokoro import KPipeline
        print('Cargando Kokoro TTS...')
        _kokoro_pipeline = KPipeline(lang_code='e')
        print('Kokoro TTS listo')
    return _kokoro_pipeline


# ── Utilidades ─────────────────────────────────────────────────────────────────
def download_model() -> None:
    os.makedirs(os.path.dirname(MODEL_DIR), exist_ok=True)
    zip_path = MODEL_DIR + '.zip'
    print('Descargando modelo Vosk español (~45MB), solo la primera vez...')
    urllib.request.urlretrieve(MODEL_URL, zip_path)
    print('Extrayendo...')
    with zipfile.ZipFile(zip_path, 'r') as zf:
        zf.extractall(os.path.dirname(MODEL_DIR))
    os.unlink(zip_path)
    print('Modelo listo\n')


def beep() -> None:
    sys.stdout.write('\x07')
    sys.stdout.flush()


def contains_wake_word(text: str) -> bool:
    t = text.lower()
    return any(w in t for w in WAKE_WORDS)


def is_exit(text: str) -> bool:
    t = text.lower()
    return any(w in t for w in EXIT_WORDS)


def normalize_wav(path: str) -> None:
    if not _SOX_AVAILABLE:
        return
    tmp = path + '.norm.wav'
    try:
        subprocess.run(
            ['sox', path, tmp, 'norm', '-3'],
            capture_output=True, timeout=5, check=True,
        )
        os.replace(tmp, path)
    except Exception:
        if os.path.exists(tmp):
            os.unlink(tmp)


def save_wav(frames: List[bytes], path: str) -> None:
    with wave.open(path, 'wb') as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(SAMPLE_RATE)
        wf.writeframes(b''.join(frames))
    normalize_wav(path)


# ── Grabación con WebRTC VAD ───────────────────────────────────────────────────
def record_with_vad(
    stream: sd.RawInputStream,
    max_secs: float,
    sil_secs: float,
    require_speech: bool = True,
) -> Optional[List[bytes]]:
    """
    Graba audio usando WebRTC VAD para detectar inicio y fin del habla.

    - Pre-roll: mantiene un anillo de frames anteriores al inicio del habla
      para no perder fonemas iniciales (ej. la 'a' de "abre").
    - Detiene la grabación cuando hay `sil_secs` seguidos de silencio VAD.
    - Retorna None si no se detecta habla en max_secs (útil para timeout
      en modo conversación).
    """
    max_frames      = int(max_secs   * 1000 / FRAME_MS)
    sil_frames_max  = int(sil_secs   * 1000 / FRAME_MS)
    preroll_frames  = int(PREROLL_SECS * 1000 / FRAME_MS)

    ring: Deque[bytes] = collections.deque(maxlen=preroll_frames)
    recorded: List[bytes] = []
    leftover = b''
    speech_started = False
    silent_count = 0

    for _ in range(max_frames + preroll_frames):
        raw, _ = stream.read(FRAME_SAMPLES)
        data = leftover + bytes(raw)
        leftover = b''

        while len(data) >= FRAME_BYTES:
            frame = data[:FRAME_BYTES]
            data = data[FRAME_BYTES:]

            try:
                is_voice = _vad.is_speech(frame, SAMPLE_RATE)
            except Exception:
                is_voice = False

            if DEBUG:
                mark = 'VOZ' if is_voice else 'SIL'
                print(f'[vad] {mark} sil={silent_count}/{sil_frames_max}', end='\r')

            if not speech_started:
                ring.append(frame)
                if is_voice:
                    speech_started = True
                    recorded.extend(ring)
                    ring.clear()
            else:
                recorded.append(frame)
                if is_voice:
                    silent_count = 0
                else:
                    silent_count += 1
                    if silent_count >= sil_frames_max:
                        return recorded

        leftover = data

    if require_speech and not speech_started:
        return None
    return recorded if recorded else None


def drain_stream(stream: sd.RawInputStream, secs: float = 0.5) -> None:
    """Descarta el audio acumulado mientras Tessia estaba hablando."""
    n = int(secs * 1000 / FRAME_MS)
    for _ in range(n):
        stream.read(FRAME_SAMPLES)


# ── API y síntesis ─────────────────────────────────────────────────────────────
def send_to_tessia(text: str) -> dict:
    r = requests.post(f"{API_URL}/voice/chat", json={'text': text}, timeout=180)
    r.raise_for_status()
    return r.json()['data']


def _speak_elevenlabs(text: str) -> bool:
    """Sintetiza con ElevenLabs. Retorna False si no hay API key o la cuota se agotó."""
    global _elevenlabs_quota_exceeded
    if not ELEVENLABS_API_KEY or _elevenlabs_quota_exceeded:
        return False
    try:
        from elevenlabs.client import ElevenLabs
        client = ElevenLabs(api_key=ELEVENLABS_API_KEY)
        audio_bytes = b''.join(client.text_to_speech.convert(
            voice_id=ELEVENLABS_VOICE_ID,
            text=text,
            model_id='eleven_multilingual_v2',
            output_format='pcm_24000',
        ))
        audio_np = np.frombuffer(audio_bytes, dtype=np.int16).astype(np.float32) / 32768.0
        sd.play(audio_np, samplerate=24000, blocking=True)
        sd.wait()
        return True
    except Exception as e:
        status = getattr(e, 'status_code', None)
        if status in (402, 429) or any(w in str(e).lower() for w in ('quota', 'exceeded', 'limit')):
            print(f'[TTS] ElevenLabs sin créditos — usando Kokoro como fallback')
            _elevenlabs_quota_exceeded = True
        else:
            print(f'[TTS] Error ElevenLabs ({e}) — usando Kokoro como fallback')
        return False


def _speak_kokoro(text: str) -> None:
    pipeline = _get_kokoro()
    chunks = [audio for _, _, audio in pipeline(text, voice=KOKORO_PY_VOICE, speed=KOKORO_PY_SPEED)]
    if chunks:
        sd.play(np.concatenate(chunks), samplerate=24000, blocking=True)
        sd.wait()


def speak(text: str) -> None:
    if not _speak_elevenlabs(text):
        _speak_kokoro(text)


def process_frames(frames: List[bytes]) -> Optional[str]:
    if not frames:
        return None

    with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as f:
        wav_path = f.name
    try:
        save_wav(frames, wav_path)
        transcript = transcribe_local(wav_path)
        if not transcript:
            print('No se detectó voz\n')
            return None
        print(f'Tu: "{transcript}"')
        result = send_to_tessia(transcript)
        print(f'Tessia: "{result["response"]}"\n')
        speak(result['response'])
        return transcript
    except requests.RequestException as e:
        print(f'Error al conectar con el servidor: {e}\n')
        return None
    except Exception as e:
        print(f'Error: {e}\n')
        return None
    finally:
        os.unlink(wav_path)


# ── Bucle principal ────────────────────────────────────────────────────────────
def main() -> None:
    if not os.path.exists(MODEL_DIR):
        download_model()

    print('Cargando modelo Vosk (vocabulario completo para mejor deteccion del wake word)...')
    vosk_model = Model(MODEL_DIR)
    # Sin gramática restringida: Vosk usa vocabulario completo.
    # La gramática restringida ["tessia", "[unk]"] causaba demasiados falsos negativos
    # porque forzaba al modelo a encajar cualquier audio en sólo dos tokens.
    rec = KaldiRecognizer(vosk_model, SAMPLE_RATE)

    try:
        _get_whisper()
    except Exception as e:
        print(f'Whisper no disponible: {e}')
        sys.exit(1)

    if ELEVENLABS_API_KEY:
        print('ElevenLabs TTS activo (Kokoro como fallback si se agota la cuota)')
    else:
        print('ELEVENLABS_API_KEY no configurada — usando Kokoro TTS')
        try:
            _get_kokoro()
        except Exception as e:
            print(f'Kokoro TTS no disponible: {e}')
            sys.exit(1)

    if _SOX_AVAILABLE:
        print('sox detectado — normalizacion de audio activa')

    print(f'Tessia lista — VAD modo {VAD_MODE} — di "Tessia" para activar\n')

    with sd.RawInputStream(
        samplerate=SAMPLE_RATE,
        channels=1,
        dtype='int16',
        blocksize=FRAME_SAMPLES,   # frames de 30ms exactos, lo que necesita webrtcvad
    ) as stream:
        leftover = b''

        while True:
            # ── Escuchar wake word con Vosk (vocabulario completo) ─────────────
            raw, _ = stream.read(FRAME_SAMPLES)
            data = leftover + bytes(raw)
            leftover = b''
            wake_detected = False

            while len(data) >= FRAME_BYTES:
                frame = data[:FRAME_BYTES]
                data = data[FRAME_BYTES:]

                if rec.AcceptWaveform(frame):
                    text = json.loads(rec.Result()).get('text', '')
                    rec.Reset()
                else:
                    text = json.loads(rec.PartialResult()).get('partial', '')

                if DEBUG and text:
                    print(f'[vosk] "{text}"', end='\r')

                if contains_wake_word(text):
                    rec.Reset()
                    leftover = b''
                    wake_detected = True
                    break

            if not wake_detected:
                leftover = data
                continue

            # ── Wake word detectado — grabar primer comando ────────────────────
            beep()
            drain_stream(stream, secs=0.3)
            print('Habla...')
            frames = record_with_vad(stream, MAX_SECS, SIL_SECS, require_speech=True)

            if frames:
                print('Procesando...')
                process_frames(frames)

            drain_stream(stream)
            rec.Reset()

            # ── Modo conversación ──────────────────────────────────────────────
            in_conversation = True
            while in_conversation:
                print(f'Conversacion activa — habla o di "bye" ({int(CONV_TIMEOUT)}s)\n')
                frames = record_with_vad(stream, CONV_TIMEOUT, SIL_SECS, require_speech=True)

                if frames is None:
                    print('Di "Tessia" para activar\n')
                    in_conversation = False
                    continue

                print('Procesando...')
                transcript = process_frames(frames)
                drain_stream(stream)

                if transcript and is_exit(transcript):
                    print('Hasta luego\n')
                    speak('Hasta luego')
                    in_conversation = False

            rec.Reset()


if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print('\nCerrando Tessia...')
