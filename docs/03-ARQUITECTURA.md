# ARQUITECTURA - Proyecto Orión

**Proyecto:** Orión MVP 1  
**Patrón:** MVC + Service Layer  
**Validación:** Manual MVP 1 → Zod MVP 2+ (cuando haya frontend)  
**Control de Acceso:** Políticas ABAC (MVP 3+)

---

## 1. Diagrama General

```
┌─────────────────────────────────────────────────────┐
│              USUARIO FINAL                          │
│    (Habla al micrófono, escucha respuesta)          │
└──────────────────────┬──────────────────────────────┘
                       │ Audio PCM 16kHz
                       ↓
┌─────────────────────────────────────────────────────┐
│         CLIENTE PYTHON (client/orion_client.py)     │
│   - WebRTC VAD  → detecta voz real                  │
│   - Vosk        → detecta wake word "Orión"         │
│   - faster-whisper → transcribe el comando          │
│   - Kokoro TTS  → sintetiza la respuesta            │
└──────────────────────┬──────────────────────────────┘
                       │ POST /api/voice/chat { text }
                       ↓
┌──────────────────────────────────────────────────────┐
│       ROUTER (Express)                               │
│   - POST /api/voice/chat                             │
│   - GET /api/history                                 │
│   - GET /api/settings                                │
└────────────┬─────────────────────────────────────────┘
             │
    ┌────────▼──────────┐
    │    MIDDLEWARE     │
    │ - Logger          │
    │ - Error Handler   │
    │ - Validator       │
    │ - Auth (MVP 3)    │
    └────────┬──────────┘
             │
    ┌────────▼──────────┐
    │    CONTROLLER     │
    │ - Recibe request  │
    │ - Valida input    │
    │ - Delega service  │
    │ - Responde HTTP   │
    └────────┬──────────┘
             │
    ┌────────▼──────────┐
    │     SERVICE       │
    │ - llmService      │
    │ - commandService  │
    │ - securityService │
    │ - memoryService   │
    └────────┬──────────┘
             │
    ┌────────▼──────────┐
    │      MODEL        │
    │ - messageModel    │
    │ - userModel       │
    │ - settingsModel   │
    └────────┬──────────┘
             │
    ┌────────▼──────────┐
    │   PRISMA + DB     │
    │   PostgreSQL      │
    └───────────────────┘
```

---

## 2. Estructura de Carpetas

### Estructura Completa

```
orion/
│
├── client/                           # Cliente de voz Python
│   ├── orion_client.py               # Pipeline completo: VAD + wake word + STT + TTS
│   ├── requirements.txt              # Dependencias Python
│   └── models/                       # Modelos descargados automáticamente (git-ignored)
│       └── vosk-model-small-es-0.42/
│
├── src/
│   ├── index.ts                      # Express server (punto de entrada)
│   │
│   ├── routes/
│   │   ├── voiceRouter.ts            # POST /api/voice/chat
│   │   ├── historyRouter.ts          # GET /api/history
│   │   ├── settingsRouter.ts         # GET/PATCH /api/settings
│   │   ├── healthRouter.ts           # GET /api/health
│   │   └── index.ts                  # Agregador de rutas
│   │
│   ├── controller/
│   │   ├── voiceController.ts        # Recibe texto, orquesta LLM + comandos
│   │   ├── historyController.ts      # Gestiona historial
│   │   ├── settingsController.ts     # Configuración
│   │   └── healthController.ts       # Health check
│   │
│   ├── service/
│   │   ├── llmService.ts             # Ollama + detección de intención
│   │   ├── commandService.ts         # Ejecución de comandos del sistema
│   │   ├── memoryService.ts          # Gestión de memoria (MVP 4)
│   │   ├── securityService.ts        # Validación de seguridad
│   │   └── index.ts                  # Exporta todos
│   │
│   ├── model/
│   │   ├── messageModel.ts           # Queries de mensajes
│   │   ├── userModel.ts              # Queries de usuarios
│   │   ├── settingsModel.ts          # Queries de configuración
│   │   ├── memoryModel.ts            # Queries de memoria (MVP 4)
│   │   └── index.ts                  # Exporta todos
│   │
│   ├── middleware/
│   │   ├── logger.ts                 # Logging de requests
│   │   ├── error.ts                  # Manejo global de errores
│   │   ├── validator.ts              # Validación manual (MVP 1)
│   │   ├── auth.ts                   # Autenticación (MVP 3)
│   │   └── index.ts                  # Exporta todos
│   │
│   ├── policies/
│   │   ├── voiceAccess.ts            # Control acceso por Speaker ID (MVP 3)
│   │   ├── rolePolicies.ts           # Roles: Admin, User, Child (MVP 3)
│   │   ├── commandWhitelist.ts       # Comandos permitidos
│   │   └── index.ts                  # Exporta políticas
│   │
│   ├── schemas/                      # Validación Zod (MVP 2+)
│   │   ├── voiceSchema.ts            # Validar requests de voz
│   │   ├── settingsSchema.ts         # Validar configuración
│   │   ├── userSchema.ts             # Validar datos usuario
│   │   └── index.ts                  # Exporta schemas
│   │
│   ├── utils/
│   │   ├── validators.ts             # Funciones validación (MVP 1)
│   │   ├── helpers.ts                # Funciones auxiliares
│   │   ├── errors.ts                 # Custom error classes
│   │   ├── logger.ts                 # Logger utility
│   │   └── constants.ts              # Constantes globales
│   │
│   ├── config.ts                     # Variables de entorno
│   ├── db.ts                         # Pool PostgreSQL (opcional MVP 1)
│   └── prisma.ts                     # Cliente Prisma
│
├── prisma/
│   ├── schema.prisma                 # Definición de BD
│   └── migrations/
│       └── 001-init/                 # Primera migración
│
├── tests/
│   ├── unit/
│   │   ├── services/
│   │   ├── controllers/
│   │   └── utils/
│   │
│   ├── integration/
│   │   ├── api/
│   │   ├── services/
│   │   └── db/
│   │
│   └── e2e/
│       └── voice-flow.test.ts
│
├── docs/
│   ├── 01-VISION.md
│   ├── 02-SRS.md
│   ├── 03-ARQUITECTURA.md
│   ├── 04-PLAN-CALIDAD.md
│   └── 05-SETUP.md
│
├── package.json
├── tsconfig.json
├── jest.config.js
├── .env.example
├── .gitignore
├── README.md
└── LICENSE
```

---

## 3. Responsabilidades por Capa

### 3.1 ROUTER (src/router/)

**Responsabilidad:** Definir rutas y aplicar middlewares

```
voice.router.ts
├── POST /api/voice/process
│   └── Middleware: [logger, validator, auth (MVP 3)]
│       └── Controller: voice.controller.processVoice()
│
history.router.ts
├── GET /api/history
│   └── Controller: history.controller.getHistory()
├── DELETE /api/history/:id
│   └── Controller: history.controller.deleteMessage()
│
settings.router.ts
├── GET /api/settings
│   └── Controller: settings.controller.getSettings()
├── PATCH /api/settings
│   └── Controller: settings.controller.updateSettings()
│
health.router.ts
└── GET /api/health
    └── Controller: health.controller.check()
```

**No hace:** Lógica de negocio, acceso a datos

---

### 3.2 CONTROLLER (src/controller/)

**Responsabilidad:** Manejar HTTP (recibir request, delegar, responder)

```
voice.controller.ts
├── chat(req, res)
│   ├─ Extrae texto del body
│   ├─ Valida que no esté vacío
│   ├─ Delega a llmService.detectIntent()
│   ├─ Delega a commandService.execute()
│   ├─ Delega a llmService.generateResponse()
│   └─ Responde con JSON { response, action, actionResult }
│
history.controller.ts
├── getHistory(req, res)
│   ├─ Valida userId
│   ├─ Delega a messageModel.findByUser()
│   └─ Responde lista
│
└── deleteMessage(req, res)
    ├─ Valida messageId
    ├─ Delega a messageModel.delete()
    └─ Responde 200 OK
```

**No hace:** Lógica compleja, acceso directo a BD

---

### 3.3 SERVICE (src/service/)

**Responsabilidad:** Lógica de negocio pura

```
llm.service.ts
├── detectIntent(text)
│   ├─ Llama Ollama HTTP API
│   ├─ Parsea respuesta
│   └─ Retorna { action, params }
│
├── generateResponse(transcript, result)
│   ├─ Construye prompt
│   ├─ Llama Ollama
│   └─ Retorna respuesta texto

command.service.ts
├── execute(action, params)
│   ├─ Valida comando en whitelist
│   ├─ Ejecuta comando del sistema
│   └─ Retorna resultado

security.service.ts
└── isCommandWhitelisted(cmd)
    ├─ Verifica contra política
    └─ Retorna boolean
```

**No hace:** Manejar HTTP, guardar en BD directamente

---

### 3.4 MAPPER (src/mapper/)

**Responsabilidad:** Convertir datos entre BD (snake_case) y Código (camelCase)

```
messageMapper.ts
├── toDomain(dbRow)           → BD snake_case → JS camelCase
└── toDatabase(domainObj)     → JS camelCase → BD snake_case

userMapper.ts
├── toDomain(dbRow)
└── toDatabase(domainObj)

settingsMapper.ts
├── toDomain(dbRow)
└── toDatabase(domainObj)
```

**Flujo:**

```
Código (camelCase)
       ↓
toDatabase() → Mapper convierte a snake_case
       ↓
Prisma → PostgreSQL INSERT/UPDATE
       ↓
BD devuelve fila (snake_case)
       ↓
toDomain() → Mapper convierte a camelCase
       ↓
Código recibe camelCase
```

**Ejemplo:**

```
// BD tiene:
CREATE TABLE user_message (
  id UUID,
  user_id VARCHAR,
  message_content TEXT,
  created_at TIMESTAMP
);

// Mapper toDomain convierte:
{ id, user_id, message_content, created_at }
→ { id, userId, messageContent, createdAt }

// Mapper toDatabase convierte:
{ id, userId, messageContent, createdAt }
→ { id, user_id, message_content, created_at }

// Código siempre usa camelCase
```

**No hace:** Lógica de negocio, acceso directo a Prisma

---

### 3.5 MODEL (src/model/)

**Responsabilidad:** Acceso a datos con Prisma + Mappers

```
messageModel.ts
├── create(data)              → toDatabase() → INSERT → toDomain()
├── findByUser(userId)        → SELECT → map array con toDomain()
├── findById(id)              → SELECT → toDomain()
├── delete(id)                → DELETE
└── deleteOlderThan(days)     → Limpieza automática

userModel.ts
├── create(data)              → toDatabase() → INSERT → toDomain()
├── findById(id)              → SELECT → toDomain()
├── update(id, data)          → toDatabase() → UPDATE → toDomain()
└── findByVoiceProfile(fp)    → Búsqueda por voz (MVP 3)

settingsModel.ts
├── get(userId)               → SELECT → toDomain()
└── update(userId, data)      → toDatabase() → UPDATE → toDomain()
```

**No hace:** Lógica de negocio, validación

---

### 3.6 MIDDLEWARE (src/middleware/)

**Responsabilidad:** Interceptar requests/responses

```
logger.ts
├─ Registra: método, ruta, duración
├─ Registra errores
└─ next()

validator.ts
├─ Valida formato audio (MVP 1 - simple)
├─ Valida campos presentes
└─ next() o error 400

error.ts (global)
├─ Atrapa todos los errores
├─ Formatea respuesta error
└─ Retorna HTTP status apropiado

auth.ts (MVP 3)
├─ Verifica Speaker ID
├─ Verifica JWT token
└─ next() o error 401
```

**No hace:** Lógica de negocio

---

### 3.7 POLICIES (src/policies/)

**Responsabilidad:** Control de acceso (ABAC)

```
command-whitelist.ts (MVP 1)
├─ Lista de comandos permitidos
├─ Función: isAllowed(command)
└─ Retorna: boolean

role.ts (MVP 3)
├─ Admin: todos comandos
├─ User: comandos seleccionados
├─ Child: solo música/videos
└─ Función: canExecute(role, command)

voice-access.ts (MVP 3)
├─ Speaker ID debe estar en whitelist
├─ Compara embedding con usuarios conocidos
└─ Función: isIdentified(audioFeatures)
```

**No hace:** Ejecutar comandos, manejar requests

---

### 3.8 UTILS (src/utils/)

**Responsabilidad:** Funciones reutilizables

```
validators.ts (MVP 1)
├─ validateAudioFormat()
├─ validateCommand()
└─ validateEmail()

helpers.ts
├─ parseJson()
├─ formatResponse()
└─ sanitizeString()

errors.ts
├─ class ValidationError
├─ class CommandError
└─ class AudioProcessingError

logger.ts
├─ logger.info()
├─ logger.error()
└─ logger.debug()

constants.ts
├─ SUPPORTED_COMMANDS
├─ AUDIO_SAMPLE_RATE
└─ LLM_TIMEOUT
```

**No hace:** Lógica específica del dominio

---

## 4. Flujo de Procesamiento Completo

### MVP 1

```
1. CLIENTE PYTHON
   Micrófono → WebRTC VAD → ¿hay voz?
   ├─ Vosk (vocabulario completo) → detecta "orion" en texto parcial
   ├─ faster-whisper → "abre Apple Music"
   └─ POST /api/voice/chat  { text: "abre Apple Music" }

2. ROUTER
   voice.router.ts detecta POST /chat
   Aplica middlewares: [logger, error]

3. MIDDLEWARE
   logger.ts:   registra request
   error.ts:    atrapa cualquier error

4. CONTROLLER
   voice.controller.chat(req, res)
   ├─ Extrae texto del body
   ├─ Valida que no esté vacío
   └─ Delega a processTranscript()

5. SERVICES (Orquestación)
   ├─ llmService.detectIntent(text)
   │  └─ Llama Ollama → { action: "open_app", params: {app: "Apple Music"} }
   │
   ├─ securityService.isCommandAllowed()
   │  └─ Valida contra whitelist → true
   │
   ├─ commandService.execute()
   │  └─ Ejecuta acción → "Apple Music abierto"
   │
   └─ llmService.generateResponse()
      └─ Llama Ollama → "Abriendo Apple Music para ti"

6. MODELS (Persistencia)
   messageModel.create() × 2 (user + assistant)
   → Prisma → PostgreSQL

7. RESPONSE
   res.json({
     transcript: "abre Apple Music",
     response: "Abriendo Apple Music para ti",
     action: "open_app",
     actionResult: "Apple Music abierto"
   })

8. CLIENTE PYTHON
   Recibe JSON → Kokoro TTS → sounddevice reproduce

```

**Tiempo Total:** ~4-8 segundos

---

### MVP 3 (Con Zod, Autenticación, ABAC)

```
Mismo flujo PERO con:

3. MIDDLEWARE (Ampliado)
   ├─ logger.ts
   ├─ validator.ts → schemas/voice.schema.ts (Zod)
   ├─ auth.ts → policies/voice-access.ts (Speaker ID)
   └─ error.ts

4. CONTROLLER (Con validación)
   ├─ Valida input con Zod
   ├─ Verifica políticas ABAC
   └─ Delega a servicios
```

---

## 5. Stack Tecnológico

### Backend (100% TypeScript)

- **Express.js** - Web framework
- **Node.js 18+** - Runtime
- **TypeScript** - Type safety
- **Prisma** - ORM + migrations
- **PostgreSQL** - Database

### Voice Intelligence (Cliente Python — Locales)

- **WebRTC VAD** (`webrtcvad`) - Detección de voz
- **Vosk** (modelo español 45MB) - Wake word "Orión"
- **faster-whisper** - STT (transcripción)
- **Kokoro** (voz ef_dora) - TTS
- **Ollama** (localhost:11434) - LLM local

### Testing

- **Jest** - Testing framework
- **Supertest** - API testing

### Validación (MVP 2+)

- **Zod** - Type-safe validation (cuando haya frontend)

### Políticas (MVP 3+)

- **ABAC** - Control de acceso por atributos

---

## 6. Evolución por MVP

### MVP 1 (Ahora)

```
├─ Router → Controller → Service → Model → DB
├─ Validación manual simple
├─ Sin ABAC
├─ Sin autenticación
└─ Sin Zod (no hay interfaz)
```

### MVP 2 (Streaming + Frontend)

```
├─ Agregar schemas/ con Zod
├─ Validar input con Zod
├─ WebSocket handlers
└─ Frontend React + validación cliente
```

### MVP 3 (Multi-usuario)

```
├─ Agregar policies/ ABAC
├─ middleware/auth.ts para Speaker ID
├─ Nuevas rutas: /enroll-voice, /permissions
└─ MessageModel: agregar userId
```

### MVP 4 (Memoria)

```
├─ memory.model.ts
├─ memory.service.ts
├─ memory.schema.ts
└─ LLM incluye contexto en prompts
```

---

## 7. Patrones Utilizados

### MVC + Service Layer

```
Models   → Acceso a datos (Prisma)
Views    → JSON responses (HTTP)
Controllers → Coordinan requests
Services → Lógica de negocio pura
```

### Repository Pattern

```
messageModel.ts → Abstrae Prisma queries
userModel.ts    → Abstrae Prisma queries
```

### Middleware Chain

```
Request → logger → validator → auth → controller → response
                  ↑ cada uno llama next() ↑
```

### Policy-Based Access Control (ABAC)

```
Controller valida:
├─ ¿Quién eres? (Speaker ID - MVP 3)
├─ ¿Qué rol tienes? (Admin/User/Child)
└─ ¿Puedes ejecutar esto? (Whitelist)
```

---

## 8. Decisiones Arquitectónicas

### Validación Manual MVP 1

**Razón:** No hay interfaz gráfica, solo API. Zod es overkill.

### Zod para MVP 2+

**Razón:** Cuando haya frontend React, necesitas validación type-safe en request/response.

### ABAC en MVP 3

**Razón:** Multi-usuario requiere control granular (Admin ≠ Child).

### Políticas Separadas

**Razón:** Control de acceso no es responsabilidad de controller/service.

### Models para Prisma

**Razón:** Encapsula queries, reutilizable en múltiples controllers.

---

## 9. Cómo Agregar Nueva Feature

### Ejemplo: Nuevo comando "reproducir música"

1. **Agregar comando a whitelist**

    ```
    policies/command-whitelist.ts
    → Agregar "play_music" a ALLOWED_COMMANDS
    ```

2. **Crear test**

    ```
    tests/unit/services/command.service.test.ts
    → Test para play_music
    ```

3. **Agregar lógica en service**

    ```
    service/command.service.ts
    → Agregar case "play_music"
    ```

4. **Agregar validación si es MVP 2+**

    ```
    schemas/command.schema.ts
    → Validar params de play_music
    ```

5. **Commit**
    ```bash
    git commit -m "feature: reproducir música"
    ```

---

## 10. Checklist para Agregar Servicio Nuevo

- Crear archivo: `src/service/nuevo.service.ts`
- Agregar métodos públicos
- Crear tests unitarios
- Integrar en controller existente
- Documentar qué hace
- Commit

---
