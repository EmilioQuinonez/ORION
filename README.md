# ORIÓN - Asistente de Voz IA Local

[![Status](https://img.shields.io/badge/status-MVP%201-blue?style=flat-square)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2+-blue?style=flat-square)]()
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

# 2. Setup (instala todo)
npm install
cp .env.example .env
npx prisma migrate dev

# 3. Terminal 1: Ollama (modelos IA)
ollama serve

# 4. Terminal 2: App
npm run dev

# 5. Abre navegador
http://localhost:3000
```

**Tiempo total:** ~30 minutos (la mayoría descargando modelos)

---

## ¿Qué es Orión?

### La Idea

Un asistente como **Siri, Alexa o Google Assistant**, pero:

- **100% Privado** - Todo en tu máquina, sin cloud
- **100% Tuyo** - Código abierto, bajo tu control
- **100% Gratis** - Costo $0 (sin suscripciones)
- **Inteligente** - Usa Qwen 3.5 9B + Claude Code
- **Multiusuario** - Tu familia entera (identificación por voz)

### Vs. Competidores

| Feature          | Orión | Siri | Alexa | Google |
| ---------------- | ----- | ---- | ----- | ------ |
| Privado          | ✅    | ⚠️   | ❌    | ❌     |
| Funciona Offline | ✅    | ⚠️   | ❌    | ❌     |
| Gratis           | ✅    | ✅   | ❌    | ✅     |
| Personalizable   | ✅    | ❌   | ❌    | ⚠️     |

---

## Arquitectura (30 segundos)

```
┌─────────────────────────────────────┐
│      Usuario (habla al micrófono)   │
└────────────────────┬────────────────┘
                     │ Audio
                     ↓
            ┌─────────────────┐
            │  Node.js API    │
            │  (Express)      │
            └────────┬────────┘
                     │
        ┌────────────┼────────────┐
        ↓            ↓            ↓
    ┌────────┐  ┌────────┐  ┌────────┐
    │ STT    │  │  LLM   │  │  TTS   │
    │Whisper │  │ Ollama │  │Kokoro.js│
    └────────┘  └────────┘  └────────┘
                     │
                     ↓
            ┌─────────────────┐
            │  PostgreSQL     │
            │  (Historial)    │
            └─────────────────┘
```

**Stack:** 100% TypeScript (Node.js, Express, React, Prisma)

---

## Documentación Completa

Todos los detalles técnicos están documentados:

| Doc                    | Tema                          | Duración     |
| ---------------------- | ----------------------------- | ------------ |
| **01-VISION.md**       | Qué es, por qué, costo        | 5 min        |
| **02-SRS.md**          | Requisitos formales           | 15 min       |
| **03-ALCANCE.md**      | MVP 1 definido (20+ comandos) | 15 min       |
| **04-ARQUITECTURA.md** | Diseño técnico, flujos        | 20 min       |
| **05-PLAN-CALIDAD.md** | Testing >80%, examples        | 20 min       |
| **06-SETUP.md**        | Instalación paso a paso       | 30 min setup |

👉 **Comienza por [01-VISION.md](../orion/docs/01-VISION.md)**

---

## Comandos Principales

### Desarrollo

```bash
npm run dev              # Servidor con auto-reload
npm test                # Tests
npm test:coverage       # Tests + cobertura
```

### Base de Datos

```bash
npx prisma studio       # Ver BD visualmente
npx prisma migrate dev  # Nueva migración
```

### Producción

```bash
npm run build
npm start
```

---

## Requisitos

### Hardware Mínimo

- **RAM:** 8GB (12GB para Ollama)
- **Disco:** 20GB libres (10GB modelos)
- **CPU:** 2+ cores
- **Micrófono + Parlantes:** USB funciona

### Software

- **Node.js** 18+
- **PostgreSQL** 14+
- **Ollama** (para modelos)
- **Git**

### Costo

- **Backend:** Node.js (gratis)
- **Database:** PostgreSQL (gratis)
- **LLM:** Ollama + Qwen 3.5 9B (gratis)
- **STT:** Whisper (gratis)
- **TTS:** Kokoro.js (gratis)
- **TOTAL:** $0

---

## Fases de Desarrollo

```
MVP 1       MVP 2       MVP 3       MVP 4       MVP 5+
(Ahora)     (1-2 sem)   (3-4 sem)   (5-6 sem)   (Después)

STT+LLM+TTS Streaming   Multi-user  Memoria     Domótica
Comandos    WebSocket   Speaker ID  Context     Home Asst
20+ cmds    Chat UI     Permisos    Integraciones
            20+ cmds    Audit       Agenda
```

---

## Privacidad y Seguridad

**MVP 1:**

- Todo local (Whisper, Ollama, Kokoro.js)
- BD local (PostgreSQL)
- Validación de comandos
- Logging de auditoría

**MVP 3+:**

- Speaker identification (voz única)
- Permisos por usuario
- Audit logs completos

**Nunca:**

- Datos a terceros sin consentimiento
- Comandos peligrosos (rm -rf /)
- Acceso sin identificación (MVP 3)

---

## Estructura de Carpetas

```
orion/
│
├── src/
│   ├── index.js
│   ├── router/
│   ├── controller/
│   ├── service/
│   ├── model/
│   ├── middleware/
│   ├── policies/
│   ├── schemas/
│   ├── utils/
│   ├── config.ts
│   ├── db.ts
│   └── prisma.ts
│
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│
├── data/
│   ├── seed.ts
│   └── orion_db.ts
│
├── tests/
│   ├── unit/
│   └── integration/
│
├── docs/
├── package.json
├── tsconfig.json
├── jest.config.js
├── .env.example
├── .gitignore
├── README.md
└── LICENSE
```

---

## 🛠️ Stack Tecnológico

### Backend

- **Node.js 18+** - Runtime
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **Prisma** - ORM
- **PostgreSQL** - Database

### Voice Intelligence

- **Whisper** (via `node-whisper`) - STT
- **Ollama** - LLM local
- **Kokoro.js** - TTS

### Frontend

- **React 18** - UI
- **TypeScript** - Type safety
- **Vite** - Build tool

### Testing

- **Jest** - Testing framework
- **Supertest** - API testing

---

## 🚀 Casos de Uso MVP 1

```bash
# Sistema
"apagar ordenador"       → Apaga
"¿qué hora es?"          → Te dice la hora

# Aplicaciones
"abre Apple Music"           → Abre Apple Music
"abre Chrome"            → Abre navegador

# Música
"reproduce rock"         → Pone música
"siguiente canción"      → Siguiente track

# Información
"¿capital de Francia?"   → Busca y responde
"resumen de noticias"    → Resume news
```

---

## 📊 Métricas de Éxito

**MVP 1 Completado Cuando:**

- ✅ 20+ comandos funcionan
- ✅ Precisión STT ≥95%
- ✅ Latencia E2E <8 segundos
- ✅ Tests: >80% coverage
- ✅ 0 bugs críticos en 3 días

---

## 🔧 Troubleshooting

### "Ollama no responde"

```bash
# En terminal separada
ollama serve
```

### "PostgreSQL connection refused"

```bash
# Iniciar servicio
brew services start postgresql  # macOS
sudo systemctl start postgresql # Linux
```

### "Micrófono no funciona"

```bash
# Listar dispositivos
npm run list-devices

# Cambiar en .env
MICROPHONE_DEVICE_INDEX=1
```

👉 Más soluciones en [06-SETUP.md](../orion/docs/05-SETUP.md)

---

## 📄 Documentación Completa

| Documento              | Contenido                                |
| ---------------------- | ---------------------------------------- |
| **01-VISION.md**       | Visión, stack, costo, comparación        |
| **02-SRS.md**          | Requisitos formales (RF, RNF, reglas)    |
| **03-ARQUITECTURA.md** | Diseño técnico, flujos, ejemplos         |
| **04-PLAN-CALIDAD.md** | Testing strategy, 150+ tests, examples   |
| **05-SETUP.md**        | Instalación paso a paso, troubleshooting |

---

## 📈 Estado del Proyecto

```
MVP 1: En desarrollo
├─ Backend:     0%
├─ Voice (STT): 0%
├─ LLM:         0%
├─ TTS:         0%
├─ Testing:     0%
└─ Docs:        100% ✓

MVP 2: Planeado (2-3 semanas)
└─ Streaming + WebSocket

MVP 3: Planeado (4-5 semanas)
└─ Multi-usuario + Speaker ID
```

---

## 💬 Últimas Palabras

**Orión demuestra que es posible tener un asistente de IA inteligente, privado, completo y completamente gratis.**

No es alternativa a Siri/Alexa. Es **tu propia asistente personal**, controlada por ti, para ti, sin intermediarios.

---

**Última actualización:** Junio 2026  
**Versión:** 0.1.0  
**Stack:** 100% TypeScript, 100% Local, 100% Gratis
