# SRS - Especificación de Requisitos de Software

**Proyecto:** Orión - Asistente de Voz Local  
**Versión:** 1.0  
**Fecha:** Junio 2026  
**Estado:** Aprobado para MVP 1

---

## 1. Introducción

### 1.1 Objetivo General

Especificar completamente los requisitos funcionales, no funcionales, reglas de negocio e interfaces para un asistente de IA basado en voz que funciona completamente en local con máxima privacidad.

### 1.2 Alcance

Este documento cubre MVP 1-3 (primeras 8 semanas de desarrollo). MVPs posteriores se especificarán en documentos separados.

### 1.3 Definiciones

- **STT:** Speech-to-Text (audio → texto)
- **TTS:** Text-to-Speech (texto → audio)
- **LLM:** Large Language Model (modelo de IA)
- **E2E:** End-to-End (flujo completo)
- **MVP:** Minimum Viable Product (versión mínima funcional)

---

## 2. Requisitos Funcionales (MVP 1-3)

### RF-001: Captura de Audio

**Descripción:** El sistema debe capturar audio del micrófono en tiempo real

**Requisitos:**

- Capturar a 16kHz, mono, PCM
- Soporte múltiples dispositivos de entrada
- Detección automática de silencio
- Timeout 30 segundos máximo

**Criterios de Aceptación:**

- [ ] Audio se captura sin ruido excesivo
- [ ] Sistema detecta cuando para de hablar
- [ ] Maneja error si micrófono desconectado

---

### RF-002: Transcripción de Audio (Whisper)

**Descripción:** Convertir audio capturado a texto usando Whisper

**Requisitos:**

- Usar `node-whisper` (TypeScript)
- Soporte español + inglés
- Precisión ≥ 95% en español
- Latencia < 3 segundos

**Criterios de Aceptación:**

- [ ] Transcribe correctamente "abre Apple Music"
- [ ] Detecta idioma automáticamente
- [ ] Maneja acentos y variantes españolas

---

### RF-003: Procesamiento con LLM (Ollama)

**Descripción:** Procesar comando con Qwen 3.5 9B via Ollama

**Requisitos:**

- Conectar a Ollama localhost:11434
- Modelo: Qwen 3.5 9B
- System prompt en español
- Context awareness básico

**Criterios de Aceptación:**

- [ ] Responde preguntas naturalmente
- [ ] Entiende intención de comandos
- [ ] Latencia < 2s (GPU) o < 5s (CPU)

---

### RF-004: Síntesis de Voz (Kokoro.js)

**Descripción:** Convertir respuesta a audio reproducible

**Requisitos:**

- Usar `kokoro-js` (TypeScript)
- Voces en español disponibles
- Reproducción automática en parlantes
- Calidad aceptable para conversación

**Criterios de Aceptación:**

- [ ] Genera audio desde texto
- [ ] Se reproduce sin lag
- [ ] Audible y comprensible

---

### RF-005: Ejecución de Comandos

**Descripción:** Ejecutar acciones basadas en intención detectada

**Requisitos:**

- Abrir aplicaciones (Apple Music, Chrome, etc)
- Ejecutar comandos del sistema
- Búsqueda en internet
- Reproducción de música

**Requisitos Seguridad:**

- Validar comando antes de ejecutar
- Whitelist de comandos permitidos
- No ejecutar comandos peligrosos (rm -rf)
- Auditar cada ejecución

**Criterios de Aceptación:**

- [ ] "abre Apple Music" abre Apple Music
- [ ] "reproduce música" funciona
- [ ] Comandos peligrosos rechazados
- [ ] Log de acciones completo

---

### RF-006: Persistencia de Datos

**Descripción:** Guardar conversaciones e historial

**Requisitos:**

- PostgreSQL local
- Guardar: usuario, mensaje, respuesta, timestamp
- Limpiar datos >30 días
- Queries < 100ms

**Criterios de Aceptación:**

- [ ] Datos persisten entre sesiones
- [ ] Historial consultable
- [ ] BD privada en disco local

---

### RF-007: Multi-usuario (MVP 3)

**Descripción:** Identificar quién habla por voz

**Requisitos:**

- Speaker identification vía audio
- Precisión ≥ 80%
- Fallback a manual si falla
- Enrollment de nuevos usuarios

**Criterios de Aceptación:**

- [ ] Identifica usuarios registrados
- [ ] Rechaza usuarios desconocidos
- [ ] Enrollment toma < 1 minuto

---

### RF-008: Sistema de Permisos (MVP 3)

**Descripción:** Controlar qué puede hacer cada usuario

**Requisitos:**

- Roles: Admin, User, Child
- Permisos: eliminar, ejecutar, abrir apps
- Aplicar antes de ejecutar

**Matriz de Permisos:**

```
Acción          | Admin | User | Child
----------------|-------|------|-------
Abrir apps      | Todas | Sel. | Música
Ejecutar shell  | ✓     | ✗    | ✗
Eliminar files  | ✓     | ✗    | ✗
Tiempo máx      | 300s  | 300s | 60s
```

**Criterios de Aceptación:**

- [ ] Papá puede abrir todas las apps
- [ ] Niño solo puede abrir Apple Music
- [ ] Permisos se aplican correctamente

---

### RF-009: Memoria Persistente (MVP 4)

**Descripción:** Recordar preferencias y datos del usuario

**Requisitos:**

- Guardar preferencias (café sin azúcar)
- Guardar rutinas (trabajo 9-5)
- Pasar contexto al LLM
- TTL por tipo de memoria

**Criterios de Aceptación:**

- [ ] Usuario dice preferencia una vez
- [ ] Sistema la recuerda después
- [ ] LLM usa contexto en respuestas

---

## 3. Requisitos No Funcionales

### RNF-001: Performance

| Métrica    | MVP 1 | MVP 3 | Target |
| ---------- | ----- | ----- | ------ |
| STT        | <3s   | <2s   | <2s    |
| LLM        | <3s   | <2s   | <2s    |
| TTS        | <2s   | <1s   | <1s    |
| Speaker ID | N/A   | <3s   | <2s    |
| E2E Total  | <8s   | <5s   | <5s    |

### RNF-002: Disponibilidad

- MVP 1-2: 99% (desarrollo local)
- MVP 3+: 99% (máquina dedicada)
- Recovery: Automático (restart app)

### RNF-003: Seguridad

- Validación de input 100%
- Encriptación en reposo (futuro)
- Audit logs completos
- Whitelist de comandos

### RNF-004: Privacidad

- 100% offline (Whisper, Ollama, Kokoro.js local)
- BD en disco local (PostgreSQL)
- Datos NUNCA a terceros sin consentimiento
- Fallback a Claude API es OPCIONAL

### RNF-005: Escalabilidad

- MVP 1: 1 usuario
- MVP 3: 5-10 usuarios simultáneos
- MVP 5: Multi-dispositivo

### RNF-006: Compatibilidad

- macOS 10.13+
- Windows 10/11 (WSL2)
- Ubuntu 18.04+
- Debian 10+

---

## 4. Reglas de Negocio

### RB-001: Privacidad Radical

**Declaración:** Todos los datos permanecen en el dispositivo del usuario

- Ningún dato enviado a servidores (excepto Claude API optional)
- Usuario tiene control total
- Opción borrar todo con un click

### RB-002: Costo Cero MVP 1-3

**Declaración:** MVP 1-3 completamente gratis

- Whisper: Gratis (OpenAI)
- Ollama: Gratis (open source)
- Kokoro.js: Gratis (open source)
- PostgreSQL: Gratis
- Node.js: Gratis

### RB-003: Whitelist de Comandos

**Declaración:** Solo ejecutar comandos explícitamente permitidos

- Validar comando antes de ejecutar
- Usuario agrega comandos a whitelist
- Comandos peligrosos nunca se ejecutan
- Cada ejecución registrada

### RB-004: Multi-usuario Seguro

**Declaración:** Cada usuario tiene su espacio privado

- Speaker ID como primer factor
- Permisos por rol
- Historial separado por usuario
- Datos no compartidos entre usuarios

### RB-005: Modelo Dual de IA

**Declaración:** Qwen para lo normal, Claude para lo complejo

- Qwen 3.5 9B: Conversación diaria, comandos
- Claude Code: Tareas de programación
- Fallback automático si API falla
- Control completo del usuario

### RB-006: Escalabilidad a Familia

**Declaración:** Orión funciona para 1 persona, pero está diseñado para familia

- Multi-usuario desde MVP 3
- Permisos por rol
- Privacidad individual
- Control parental opcional

---

## 5. Objetivo del Sistema

### Objetivo Principal

Crear un asistente de IA por voz que sea:

- Inteligente (entiende contexto)
- Privado (datos en local)
- Rápido (respuestas <5s)
- Confiable (uptime 99%)
- Extensible (fácil agregar features)

### Objetivo Secundario

Demostrar que es posible tener un asistente tan bueno como Siri/Alexa pero completamente privado y bajo tu control.

---

## 6. Interfaz del Sistema

### 6.1 Interfaz de Voz (Principal)

```
Usuario habla:
  ↓
"Orión, abre Apple Music"
  ↓
Sistema responde:
  "Abriendo Apple Music"
  ↓
Apple Music se abre
```

### 6.2 Interfaz Web (Dashboard)

#### Endpoints REST

```
POST   /api/voiceProcess       - Procesar comando
GET    /api/voiceStatus        - Estado actual
GET    /api/history            - Historial
GET    /api/settings           - Configuración
PATCH  /api/settings           - Actualizar config
GET    /api/health             - Health check
```

#### WebSocket (Futuro MVP 2)

```
WS /ws
  - Streaming de procesamiento
  - Real-time updates
  - Bidireccional
```

### 6.3 Interfaz de Base de Datos

#### Tablas Principales

```
users
├─ id, name, role, voice_profile

messages
├─ id, user_id, role, content, timestamp

settings
├─ user_id, language, volume, timeout

memory
├─ user_id, category, content, confidence
```

### 6.4 Interfaz de Configuración

```
CONFIGURACIÓN
├─ Volumen entrada/salida
├─ Sensibilidad micrófono
├─ Palabra clave activación
├─ Idioma
├─ Permisos por usuario
└─ Whitelist de comandos
```

---

## 7. Información Requerida

### Información que el Sistema Debe Conocer

- Usuario actual (speaker ID)
- Preferencias del usuario
- Historial de comandos
- Contexto de conversación
- Rutinas y hábitos

### Información que NO debe Conocer

- Datos bancarios
- Passwords/credenciales
- Documentos sensibles
- Historial web (a menos que usuario lo pida)

---

## 8. Criterios de Aceptación por MVP

### MVP 1: Backend Base

- [ ] Puedo hablar y escucho respuesta
- [ ] Ejecuta 20+ comandos simples
- [ ] Funciona offline (sin internet)
- [ ] BD guarda historial
- [ ] 80%+ tests pasando

### MVP 2: Voz Completa

- [ ] Streaming de respuestas
- [ ] WebSocket funciona
- [ ] UI responsive
- [ ] Conversación fluida

### MVP 3: Multi-usuario

- [ ] 5+ usuarios registrados
- [ ] Speaker ID > 85% precisión
- [ ] Permisos funcionan
- [ ] Audit logs completos

---

## 9. Restricciones y Supuestos

### Restricciones Técnicas

- Node.js 18+
- PostgreSQL 14+
- Ollama debe correr
- Micrófono + parlantes

### Supuestos

- Usuario tiene 8GB+ RAM
- Usuario entiende instalación npm
- Ambiente de red local seguro

---

**Siguiente documento:** 03-ARQUITECTURA.md
