# VISIÓN - Proyecto Orión

**Proyecto:** ORIÓN - Asistente de Voz Local Inteligente  
**Stack:** 100% TypeScript (Node.js, Express, React)  
**Modelos IA:** Qwen 3.5 9B (local via Ollama) + Claude Code (API, opcional)  
**Costo:** $0 MVP 1-3 | $0-50/mes MVP 5+  
**Privacidad:** 100% Local - Sin datos a terceros sin consentimiento

---

## ¿Qué es Orión?

Un **asistente de IA personal que funciona por voz**, identificando quién habla, entendiendo comandos en español y ejecutando acciones - completamente en tu máquina.

### Diferencias Clave vs Competidores

| Feature              | Orión    | Siri       | Alexa  | Google Assistant |
| -------------------- | -------- | ---------- | ------ | ---------------- |
| **Funciona offline** | ✅       | ⚠️ Parcial | ❌     | ❌               |
| **Datos locales**    | ✅       | ⚠️ Apple   | ❌ AWS | ❌ Google        |
| **Gratis**           | ✅       | ✅         | ❌     | ✅ Limitado      |
| **Personalizable**   | ✅       | ❌         | ❌     | ⚠️ Limitado      |
| **Multiusuario**     | ✅ MVP 3 | ✅         | ✅     | ✅               |

---

## Stack Tecnológico Elegido (100% TypeScript)

### Backend

- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** PostgreSQL + Prisma ORM

### Frontend

- **Framework:** React 18
- **Language:** TypeScript
- **Build:** Vite

### Modelos IA (Locales - Sin Python)

- **STT (Audio→Texto):** Whisper (via `node-whisper`)
- **LLM (Inteligencia):** Ollama local → Qwen 3.5 9B
- **TTS (Texto→Audio):** Kokoro.js
- **Fallback Cloud:** Claude Code API (opcional, futuro)

### Integraciones (MVP 5+)

- Home Assistant (domótica)
- Google Calendar (agenda)
- Gmail (email)

---

## Propósito y Valor

### El Problema

Los asistentes de voz modernos requieren:

- Conexión a internet constante
- Envío de datos a servidores remotos
- Dependencia de grandes corporaciones
- Costos recurrentes ($99-999/año)
- Limitaciones según región/idioma

### La Solución: Orión

- **Privacidad Radical** - 100% offline, datos en tu máquina
- **Gratis** - Sin costos recurrentes, código abierto
- **Personalizable** - Tu código, tu control total
- **Inteligente** - Qwen 3.5 9B + Claude Code para lo complejo
- **Multiusuario** - Tu familia con permisos distintos
- **Extensible** - Integra lo que necesites

---

## Objetivos

### Corto Plazo (MVP 1-2, 2-4 semanas)

- Backend funcional (Express + PostgreSQL)
- STT working (Whisper → texto)
- LLM working (Ollama → respuestas)
- TTS working (Kokoro.js → audio)
- 20+ comandos ejecutándose

### Mediano Plazo (MVP 3-4, 4-8 semanas)

- Identificación de usuario por voz
- Sistema de permisos multiusuario
- Memoria persistente (preferencias, rutinas)
- Context-aware responses
- Audit logging completo

### Largo Plazo (MVP 5+, 2+ meses)

- Integración domótica (luces, termostato)
- Multi-dispositivo (Mac, PC, iPhone)
- Integraciones avanzadas (calendario, email, tareas)
- Marketplace de plugins

---

## Propuesta Única de Valor

**"Un asistente de IA inteligente, privado y completamente tuyo"**

### Por qué Orión es especial:

1. **Privacidad Primera** - Datos nunca salen de tu casa
2. **Tecnología de Punta** - Qwen 3.5 9B + Claude Code
3. **Gratis Forever** - $0 en MVP 1-3, $0-50/mes después (opcional)
4. **Tu Control** - Modifica, personaliza, extiende
5. **Familiy Ready** - Multi-usuario con identificación de voz

---

## Casos de Uso (MVP 1-3)

### Día a Día

```
"Orión, abre Apple Music"              → Abre aplicación
"¿Cuál es la capital de Francia?"  → Busca y responde
"Reproduce música relajante"        → Abre Apple Music con playlist
"¿Qué hora es?"                     → Te dice la hora
"Prende las luces"                  → Home Assistant (MVP 5)
```

### Multi-usuario (MVP 3)

```
Papá habla: "Abre Terminal"
→ Identificado: Papá (Admin)
→ Permitido: SÍ ✅
→ Ejecuta: Terminal abierta

Niño habla: "Abre Terminal"
→ Identificado: Niño (Child)
→ Permitido: NO ❌
→ Responde: "Solo papá puede hacer eso"
```

---

## Métricas de Éxito

### MVP 1 Completado Cuando:

- Puedo hablar comandos simples
- Orión responde por voz clara
- Ejecución sin errores críticos
- Funciona offline (sin internet)
- 80%+ tests pasando

### MVP 3 Completado Cuando:

- 5+ usuarios registrados
- Speaker ID > 85% precisión
- Permisos funcionan correctamente
- Memoria persistente

### Largo Plazo:

- 10+ MVPs completados
- Integraciones con 20+ servicios

---

## Diferencia vs Alternativas

### vs Siri/Alexa/Google

- Nuestro: Local, privado, gratis
- Ellos: Cloud, corporativo, datos compartidos

### vs Talon/Voicelabs (voice software)

- Nuestro: IA inteligente, respuestas naturales
- Ellos: Scripting básico, sin IA

---

## Restricciones y Realidades

### Hardware Requerido

- RAM: 8GB mínimo (12GB ideal para Ollama)
- Disco: 20GB libres (10GB para modelos)
- CPU: 2+ cores (más rápido con 4+)
- GPU: Opcional (mejora performance)

### Limitaciones Intencionales MVP 1-2

- No cloud sync (MVP 5+)
- No mobile app (MVP 6+)
- No domótica (MVP 5+)
- No email (MVP 5+)

### Decisiones Técnicas Finales

- 100% TypeScript
- Ollama en local (Qwen 3.5 9B)
- PostgreSQL (relacional)
- Express.js (simplismo)
- Whisper + Kokoro.js (gratis, offline)

---

## Éxito del Proyecto

Orión es **exitoso** cuando:

1. **Funcional:** Ejecuta 90%+ de comandos sin error
2. **Privado:** Todo local, nada a terceros sin permiso
3. **Rápido:** Respuestas en <5 segundos
4. **Confiable:** Uptime 99%, sin crashes
5. **Inteligente:** Entiende contexto y personalización
6. **Escalable:** Funciona para 1 usuario y para familia

---

## Roadmap Visual

```
MVP 1 (Semana 1-3)      MVP 2 (Semana 4-5)    MVP 3+ (Semana 6+)
│                       │                      │
├─ Backend Base         ├─ Streaming           ├─ Multi-user
├─ STT Working          ├─ WebSocket           ├─ Speaker ID
├─ LLM Working          ├─ Better UI           ├─ Memoria
├─ TTS Working          └─ 20+ Comandos        ├─ Permisos
├─ 20+ Comandos                                ├─ Domótica
└─ Tests Básicos                               └─ Integraciones
```

---

## Conclusión

**Orión** demuestra que es posible tener un asistente de IA inteligente, privado, completo y completamente gratis.

No es una alternativa a Siri/Alexa. Es **tu propia asistente personal**, controlada por ti, para ti, sin intermediarios.

---

**Siguiente documento:** 02-SRS.md (Requisitos detallados)
