# ORIÓN - Asistente de Voz IA Local

[![Status](https://img.shields.io/badge/status-MVP%201-blue?style=flat-square)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2+-blue?style=flat-square)]()
[![Python](https://img.shields.io/badge/Python-3.11+-yellow?style=flat-square)]()
[![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)]()
[![Cost](https://img.shields.io/badge/cost-$0-brightgreen?style=flat-square)]()

Un **asistente de IA personal por voz** que funciona completamente en local, respeta tu privacidad y está bajo tu control total.

```
"Orión, abre Apple Music"
"¿Cuál es la capital de Francia?"
"Reproduce música relajante"

→ Todo funciona offline, sin enviar datos a terceros
```

---

## Empezar en 2 Minutos

```bash
# 1. Clonar
git clone https://github.com/EmilioQuinonez/orion.git
cd orion

# 2. Setup backend
npm install
cp .env.example .env
npx prisma migrate dev

# 3. Setup cliente Python
cd client
python3.11 -m venv .venv
.venv/bin/pip install -r requirements.txt
cd ..

# 4. Terminal 1: Ollama
ollama serve

# 5. Terminal 2: Backend
npm run dev

# 6. Terminal 3: Cliente de voz
npm run client
```

**Tiempo total:** ~30 minutos (la mayoría descargando modelos)

---

## ¿Qué es Orión?

### La Idea

Un asistente como **Siri, Alexa o Google Assistant**, pero:

- **100% Privado** - Todo en tu máquina, sin cloud
- **100% Tuyo** - Código abierto, bajo tu control
- **100% Gratis** - Costo $0 (sin suscripciones)
- **Inteligente** - Usa Qwen 2.5 + Ollama local

### Vs. Competidores

| Feature          | Orión | Siri | Alexa | Google |
| ---------------- | ----- | ---- | ----- | ------ |
| Privado          | ✅    | ⚠️   | ❌    | ❌     |
| Funciona Offline | ✅    | ⚠️   | ❌    | ❌     |
| Gratis           | ✅    | ✅   | ❌    | ✅     |
| Personalizable   | ✅    | ❌   | ❌    | ⚠️     |

---

## Arquitectura

```
┌──────────────────────────────────────┐
│         CLIENTE PYTHON               │
│  client/orion_client.py              │
│                                      │
│  Micrófono                           │
│      ↓                               │
│  WebRTC VAD  ← detecta voz real      │
│      ↓                               │
│  Vosk        ← detecta "Orión"       │
│      ↓                               │
│  faster-whisper ← transcribe comando │
│      ↓                               │
│  HTTP POST /api/voice/chat           │
│      ↓                               │
│  Kokoro TTS  ← sintetiza respuesta   │
└──────────────┬───────────────────────┘
               │ texto
               ↓
┌──────────────────────────────────────┐
│         BACKEND (Express + TS)       │
│                                      │
│  POST /api/voice/chat                │
│      ↓                               │
│  llmService  ← detecta intención     │
│      ↓                               │
│  commandService ← ejecuta acción     │
│      ↓                               │
│  Ollama (Qwen 2.5) ← genera respuesta│
│      ↓                               │
│  PostgreSQL  ← guarda historial      │
└──────────────────────────────────────┘
```

**Stack de voz:** Python (VAD + Wake word + STT + TTS)
**Stack de lógica:** TypeScript (LLM + Comandos + BD)

---

## Documentación Completa

| Doc                    | Tema                          |
| ---------------------- | ----------------------------- |
| **01-VISION.md**       | Qué es, por qué, costo        |
| **02-SRS.md**          | Requisitos formales           |
| **03-ARQUITECTURA.md** | Diseño técnico, flujos        |
| **04-PLAN-CALIDAD.md** | Testing >80%, ejemplos        |
| **05-SETUP.md**        | Instalación paso a paso       |
| **06-ROADMAP.md**      | Plan de mejoras futuras       |

---

## Comandos

### Desarrollo

```bash
npm run dev              # Backend con auto-reload
npm run client           # Cliente de voz Python
npm test                 # Tests
npm run test:coverage    # Tests + cobertura
```

### Base de Datos

```bash
npx prisma studio        # Ver BD visualmente
npx prisma migrate dev   # Nueva migración
```

### Producción

```bash
npm run build
npm start
```

---

## Requisitos

### Hardware Mínimo

- **RAM:** 8GB (12GB recomendado para Ollama)
- **Disco:** 10GB libres (modelos)
- **CPU:** 2+ cores
- **Micrófono:** cualquiera funciona

### Software

- **Node.js** 18+
- **Python** 3.11+
- **PostgreSQL** 14+
- **Ollama**

### Costo

- **Backend:** Node.js + Express (gratis)
- **BD:** PostgreSQL (gratis)
- **LLM:** Ollama + Qwen 2.5 (gratis)
- **Wake word:** Vosk modelo español (gratis, ~45MB)
- **STT:** faster-whisper (gratis, local)
- **TTS:** Kokoro Python (gratis, local)
- **VAD:** WebRTC VAD (gratis)
- **TOTAL:** $0

---

## Stack Tecnológico

### Cliente Python (`client/`)

| Componente | Librería | Función |
|---|---|---|
| VAD | `webrtcvad` | Detecta si hay voz real (no amplitud) |
| Wake word | `vosk` | Detecta "Orión" en tiempo real |
| STT | `faster-whisper` | Transcribe el comando |
| TTS | `kokoro` | Sintetiza la respuesta en voz |
| Audio | `sounddevice` | Captura y reproduce audio |

### Backend TypeScript (`src/`)

| Componente | Tecnología |
|---|---|
| Framework | Express.js |
| ORM | Prisma |
| BD | PostgreSQL |
| LLM | Ollama (Qwen 2.5 local) |
| Testing | Jest + Supertest |

---

## Fases de Desarrollo

```
MVP 1 ✅     MVP 2        MVP 3        MVP 4        MVP 5+
(Ahora)      (Próximo)    (Futuro)     (Futuro)     (Futuro)

VAD+STT+TTS  OpenWakeWord Multi-user   Memoria      Domótica
Comandos     Silero VAD   Speaker ID   Contexto     Home Asst
Ollama       Streaming    Permisos     Integraciones
```

---

## Privacidad y Seguridad

**Ahora:**
- Todo local (Vosk, Whisper, Ollama, Kokoro)
- BD local (PostgreSQL)
- Validación de comandos + whitelist
- Logging de auditoría

**Futuro (MVP 3):**
- Reconocimiento de hablante (pyannote/resemblyzer)
- Permisos por usuario
- Audit logs completos

**Nunca:**
- Datos a terceros sin consentimiento
- Comandos peligrosos (rm -rf, sudo, etc.)

---

## Troubleshooting

### "Ollama no responde"
```bash
ollama serve
```

### "PostgreSQL connection refused"
```bash
brew services start postgresql   # macOS
```

### "No module named X" en el cliente Python
```bash
cd client && .venv/bin/pip install -r requirements.txt
```

### El cliente no detecta "Orión"
```bash
# Activar modo debug para ver qué escucha Vosk
ORION_DEBUG=1 npm run client
```

### Kokoro tarda mucho la primera vez
Normal — descarga el modelo (~82MB) solo la primera ejecución.

---

## Estado del Proyecto

```
MVP 1: Completado ✅
├─ Backend Express + Prisma:  ✅
├─ VAD (WebRTC):              ✅
├─ Wake word (Vosk):          ✅
├─ STT (faster-whisper):      ✅
├─ TTS (Kokoro Python):       ✅
├─ LLM (Ollama + Qwen 2.5):   ✅
├─ 22+ comandos:              ✅
├─ Testing:                   ✅
└─ Docs:                      ✅

MVP 2: Planeado → ver docs/06-ROADMAP.md
```

---

**Última actualización:** Junio 2026
**Versión:** 0.1.0
