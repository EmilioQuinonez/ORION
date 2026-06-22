# ROADMAP - Proyecto Orión

Registro de mejoras planeadas. Ordenadas por prioridad e impacto.

---

## Capa de Voz (cliente Python)

### 1. OpenWakeWord — wake word dedicado para "Orión"
**Por qué:** Vosk es un modelo de transcripción general, no está optimizado para detectar una sola palabra. OpenWakeWord es un modelo neural diseñado específicamente para wake words, consume menos CPU y tiene menos falsos positivos/negativos.

**Qué hay que hacer:**
1. Grabar 20-50 ejemplos de tu voz diciendo "Orión" en condiciones variadas (cerca, lejos, con ruido)
2. Entrenar un modelo `.onnx` con los scripts de fine-tuning de OpenWakeWord
3. Reemplazar el bloque de Vosk en el bucle de wake word de `orion_client.py`:
   ```python
   # En vez de Vosk leyendo texto y buscando "orion"...
   model = openwakeword.Model(wakeword_models=['orion_custom.onnx'])
   prediction = model.predict(frame)
   if prediction['orion_custom'] > 0.5:
       # activar
   ```
4. El modelo `.onnx` va en `client/models/` (git-ignored)

**Beneficio esperado:** Detección prácticamente instantánea, ~0.5% CPU, reconoce solo tu voz.

---

### 2. Silero VAD — reemplazar WebRTC VAD
**Por qué:** Silero VAD es un modelo neural (ONNX) más preciso que WebRTC VAD, especialmente en ambientes ruidosos o con voces poco claras. WebRTC VAD usa heurísticas espectrales; Silero usa aprendizaje profundo.

**Qué hay que hacer:**
1. Instalar `silero-vad` y `onnxruntime` en el `.venv`
2. Reemplazar `webrtcvad.Vad` por la API de Silero en `record_with_vad()`
3. Ajustar el threshold de confianza (recomendado: 0.5)

**Nota:** No requiere PyTorch si se usa con `onnxruntime` directamente.

---

### 3. Modularizar el cliente Python
**Por qué:** Cuando se agreguen OpenWakeWord y Silero, `orion_client.py` superará las 500-600 líneas y será difícil de mantener.

**Estructura propuesta:**
```
client/
├── main.py          # solo el bucle principal
├── config.py        # constantes y env vars
├── wakeword.py      # Vosk → OpenWakeWord (intercambiable)
├── vad.py           # WebRTC VAD → Silero (intercambiable)
├── stt.py           # faster-whisper
├── tts.py           # Kokoro
├── audio.py         # grabación, save_wav, sox
└── api.py           # requests al backend
```

**Cuándo hacerlo:** Al implementar OpenWakeWord o Silero VAD.

---

### 4. Reconocimiento de hablante (Speaker Verification)
**Por qué:** Que Orión solo responda a tu voz, no a cualquier persona en la habitación.

**Librerías candidatas:**
- `resemblyzer` — embeddings de voz ligeros
- `pyannote-audio` — más preciso pero más pesado

**Flujo propuesto:**
```
Voz detectada
    ↓
Extraer embedding (resemblyzer)
    ↓
Comparar con perfil guardado de Emilio
    ↓
Similitud > 0.85 → procesar
Similitud < 0.85 → ignorar
```

**Depende de:** MVP 3 (multi-usuario en backend)

---

### 5. Barge-in (interrumpir a Orión mientras habla)
**Por qué:** Siri y Alexa te dejan interrumpirlas. Ahora Orión termina de hablar antes de volver a escuchar.

**Qué hay que hacer:**
- Escuchar el micrófono en un hilo separado mientras Kokoro reproduce
- Si se detecta voz con VAD, parar la reproducción y procesar

---

## Capa de Lógica (backend TypeScript)

### 6. WebSocket para streaming de respuesta
**Por qué:** Ahora el backend espera a que Ollama termine de generar antes de responder. Con WebSocket se puede hacer streaming token a token, como ChatGPT.

**Impacto en latencia:** La primera palabra aparece en ~1s en vez de ~5s.

---

### 7. Memoria conversacional
**Por qué:** Que Orión recuerde cosas entre sesiones ("¿recuerdas lo que te dije ayer sobre...?").

**Qué hay que hacer:**
- Crear `memoryService.ts` y `memoryModel.ts`
- Vector embeddings con `ollama embeddings` o similar
- Inyectar contexto relevante en el prompt del LLM

---

### 8. Multi-usuario y permisos (MVP 3)
- Speaker ID por usuario
- Roles: Admin / User / Child
- Permisos distintos por rol (ej: Child no puede abrir terminal)
- JWT para sesiones

---

### 9. Integración con Home Assistant (MVP 5+)
- Control de luces, enchufes, termostatos
- Trigger desde Orión: "apaga las luces de la sala"

---

## Infraestructura

### 10. Tests del cliente Python
**Por qué:** Ahora no hay tests para `orion_client.py`. Si se modulariza (punto 3), cada módulo debería tener tests.

**Herramienta:** `pytest`

---

## Descartado / No hacer

| Idea | Razón |
|---|---|
| Kokoro-js (Node.js TTS) | El ecosistema Python es superior, no vale la pena mantener dos stacks de TTS |
| nodejs-whisper | Reemplazado por faster-whisper en Python, más preciso y mantenido |
| Frontend React por ahora | El cliente Python de terminal funciona bien para MVP 1-2; el frontend espera a MVP 3+ |
| APIs de STT en cloud | Contradicen el principio de privacidad total del proyecto |

---

*Última actualización: Junio 2026*
