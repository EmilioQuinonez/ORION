# PLAN DE CALIDAD - Proyecto Orión

**Proyecto:** Orión  
**Objetivo:** Mantener código limpio, testeable y bien documentado

---

## 1. Estrategia de Pruebas

### Tests a Ejecutar

| Tipo                 | Herramienta      | Cuándo                           | Cobertura  |
| -------------------- | ---------------- | -------------------------------- | ---------- |
| **Unit**             | Jest             | Siempre que escribas un servicio | >80%       |
| **Integration**      | Jest + Supertest | Después de crear endpoint        | >70%       |
| **Manual/Funcional** | Postman o curl   | Antes de PR                      | Lo crítico |

### Cómo Testear

```bash
# Unit tests (servicios, helpers)
npm test -- services/voice.service.test.ts

# Integration tests (endpoints)
npm test -- integration/voice.controller.test.ts

# Coverage
npm run test:coverage

# Watch mode (mientras desarrollas)
npm test -- --watch
```

---

## 2. Estándares de Commits

### Formato: Conventional Commits

```
<tipo>(<scope>): <descripción>
```

**El scope es opcional.**  
**La descripción en español, tiempo presente.**

### Tipos de Commits

| Tipo       | Uso                            | Ejemplo                                            |
| ---------- | ------------------------------ | -------------------------------------------------- |
| `feat`     | Nueva funcionalidad            | `feat(voice): agrega transcripción con Whisper`    |
| `fix`      | Corregir bug                   | `fix(llm): corrige timeout de Ollama`              |
| `docs`     | Documentación                  | `docs: actualiza README con instrucciones`         |
| `style`    | Formato, espacios, etc         | `style: ajusta indentación en controllers`         |
| `refactor` | Reescribir sin cambiar función | `refactor(service): simplifica lógica de comandos` |
| `test`     | Agregar/modificar tests        | `test(voice): cubre casos de error en STT`         |
| `chore`    | Tareas sin código funcional    | `chore: actualiza dependencias npm`                |

### Ejemplos Reales para Orión

```bash
# Feature nueva
git commit -m "feat(voice): implementa transcripción Whisper"
git commit -m "feat(llm): integra Ollama para detección de intención"
git commit -m "feat(command): ejecuta comandos del sistema"

# Bug fixes
git commit -m "fix(voice): resuelve error de buffer de audio"
git commit -m "fix(security): valida comando antes de ejecutar"

# Tests
git commit -m "test(service): cubre casos de error en LLM"
git commit -m "test(controller): valida response de /api/voice/process"

# Documentación
git commit -m "docs: agrega guía de primeros pasos"

# Refactor
git commit -m "refactor(service): separa lógica de validación"

# Chores
git commit -m "chore: actualiza Express a 4.19"
```

---

## 3. Estándares de Ramas

### Estructura de Ramas

```
main              ← Producción (tags: v0.1.0, v0.2.0, etc)
    ↑
develop           ← Rama de integración (tests + merge de features)
    ↑
feature/nombre    ← Tus features (crean desde develop)
fix/nombre        ← Bugs (crean desde develop)
```

### Nombrado de Ramas

#### Para Features

```
feature/descripcionCorta
```

**Ejemplos:**

```bash
feature/transcripcionWhisper
feature/deteccionIntension
feature/ejecutarComandos
feature/sintesisVoz
feature/whitelistComandos
feature/historialConversaciones
```

#### Para Fixes

```
fix/descripcionCorta
```

**Ejemplos:**

```bash
fix/timeoutOllama
fix/validacionAudio
fix/errorBuffer
fix/comandoPeligroso
```

### Reglas por Rama

**Feature:**

- Contiene: feat, test, refactor, docs, style
- Ejemplo commits:
    ```
    feat: implementa transcripción
    test: agrega pruebas
    refactor: mejora lógica
    docs: actualiza documentación
    ```

**Fix:**

- Contiene: fix, refactor, test, docs
- Ejemplo commits:
    ```
    fix: corrige error de validación
    test: cubre el bug
    refactor: simplifica validación
    ```

---

## 4. Flujo de Trabajo Típico

### Para una Feature Nueva

```bash
# 1. Crear rama desde develop
git checkout develop
git pull origin develop
git checkout -b feature/transcripcionWhisper

# 2. Desarrollar con commits pequeños
git commit -m "feat: configura node-whisper"
git commit -m "test: agrega tests unitarios"
git commit -m "feat: implementa transcripción"
git commit -m "test: agrega tests de integración"
git commit -m "docs: documenta función transcribe()"

# 3. Hacer tests locales
npm test
npm run lint

# 4. Hacer PR a develop (descripción clara)
git push origin feature/transcripcionWhisper
# Abre PR en GitHub

# 5. Descripción del PR
'''
## Descripción
Implementa transcripción de audio usando Whisper local

## Detalles técnicos
- Usa node-whisper para transcribir en tiempo real
- Soporta español e inglés
- Timeout de 10 segundos

## Tipo de cambio
- [ ] Nueva funcionalidad
- [ ] Estilos
- [ ] Pruebas
- [ ] Refactoriza
- [ ] Resuelve defectos
- [ ] Resuelve inconsistencias
- [ ] Documentación
- [ ] Chore
- [ ] Otro (especificar):

## Cómo se ha probado
- [ ] Test unitario
- [ ] Test integración
- [ ] Prueba manual

## Checklist
- [ ] Mi código sigue los estándares del proyecto
- [ ] Mis cambios no generan nuevos warnings
- [ ] Sigue el estandar de commits
- [ ] He añadido tests que prueban mi funcionalidad
- [ ] Todos los tests pasan localmente
'''

# 6. Una vez aprobado, hacer merge a develop
git checkout develop
git merge feature/transcripcion-whisper
git push origin develop

# 7. Eliminar rama local
git branch -d feature/transcripcionWhisper
```

### Para un Bug Fix

```bash
# 1. Crear rama desde develop
git checkout develop
git pull origin develop
git checkout -b fix/timeoutOllama

# 2. Fijar el problema
git commit -m "fix: aumenta timeout de Ollama a 15s"
git commit -m "test: cubre timeout"

# 3. Tests y merge similar al de features
npm test
npm run lint

# Hacer PR a develop...
```

---

## 5. Estándares de Codificación (Básicos)

### Nombres

```typescript
// Correcto
const getStatus = () => {};
const userName = "John";
const MAX_USERS = 100;

// Incorrecto
const get_status = () => {};
const userNAME = "John";
const maxUsers = 100;
```

### Indentación

- **2 espacios** (o 4, pero sé consistente)

### Sin Código Muerto

- Elimina funciones no usadas
- Elimina variables no usadas
- Elimina imports no usados

### Nombrado Consistente entre Capas

```typescript
// Misma función debe llamarse igual en todas partes
// controller/voice.controller.ts
processVoice() → this.voiceService.processVoice()

// service/voice.service.ts
processVoice() → return await this.model.processVoice()

// model/voice.model.ts
processVoice() → Prisma query
```

---

## 6. Linting y Formato

### Antes de Cada Commit

```bash
# Linting (errores de código)
npm run lint

# Formato (espacios, indentación)
npm run format

# Tests
npm test

# Todo bien? Commit y push
git commit -m "mensaje"
git push origin feature/rama
```

### Configuración ESLint

```bash
npm install --save-dev eslint prettier @typescript-eslint/eslint-plugin
```

---

## 7. Definición de Ready (DoR)

Una tarea está lista para hacer cuando:

- Sé exactamente qué debo implementar
- Sé cómo testearla
- Sé dónde va en la arquitectura (qué archivo/carpeta)
- Identifico dependencias (¿necesito otra cosa primero?)

---

## 8. Definición de Done (DoD)

Una funcionalidad está **LISTA** cuando:

- El código está escrito
- Pasan tests unitarios (`npm test`)
- Pasan tests de integración
- Linting limpio (`npm run lint`)
- Sin warnings
- Documentación actualizada (comentarios + README)
- PR creado a `develop`
- Code review personal (reviso mi propio código)
- Merge a `develop`
- Probado manualmente (curl/Postman)

---

## 9. Criterios de Aceptación

### General

| Criterio        | Check                         |
| --------------- | ----------------------------- |
| **Funciona**    | ¿Hace lo que debería?         |
| **Testeable**   | ¿Tiene tests?                 |
| **Limpio**      | ¿Sin código muerto?           |
| **Documentado** | ¿Se entiende cómo funciona?   |
| **Seguro**      | ¿Valida inputs?               |
| **Mantenible**  | ¿Fácil de entender y cambiar? |

### Por Feature

```
Voice Service (Transcripción)
├─ ¿Transcribe correctamente? (>95% precisión)
├─ ¿Maneja errores? (audio inválido, timeout)
├─ ¿Tiene tests? (unit + integration)
└─ ¿Está documentado? (comentarios + docs)

LLM Service (Ollama)
├─ ¿Detecta intención correctamente?
├─ ¿Maneja timeout de Ollama?
├─ ¿Tiene tests?
└─ ¿Está documentado?

Command Service
├─ ¿Valida comando antes de ejecutar?
├─ ¿Rechaza comandos peligrosos?
├─ ¿Tiene tests de seguridad?
└─ ¿Está documentado?
```

---

## 10. Checklist Antes de Hacer PR

```bash
# 1. Linting
npm run lint

# 2. Formato
npm run format

# 3. Tests
npm test

# 4. Coverage
npm run test:coverage

# 5. Código limpio
# Sin variables no usadas
# Sin funciones muertas
# Sin imports innecesarios
# Nombres claros

# 6. Documentación
# Comentarios en código complejo
# README actualizado si es necesario
# Commits con mensajes claros

# 7. Si todo OK:
git push origin feature/rama
# Abre PR en GitHub
```

---

## 11. Checklist Antes de Merge a Main

```bash
# 1. En develop, merged feature/rama
git checkout develop
git merge feature/rama

# 2. Tests en develop
npm test

# 3. Build de producción
npm run build

# 4. Crear tag de versión
git tag v0.1.0
git push origin v0.1.0

# 5. Merge a main
git checkout main
git merge develop
git push origin main

# 6. Cleanup
git branch -d feature/rama
git push origin --delete feature/rama
```

---

## 12. Versioning Simple

```
v0.1.0 → MVP 1 completado
v0.2.0 → MVP 2 completado
v0.3.0 → MVP 3 completado
v1.0.0 → Producción
```

### Cómo crear tags

```bash
# Local
git tag v0.1.0

# Push a GitHub
git push origin v0.1.0

# Ver todos los tags
git tag -l
```

---

## 13. Herramientas Clave

| Herramienta   | Uso              | Comando                  |
| ------------- | ---------------- | ------------------------ |
| **Jest**      | Tests unitarios  | `npm test`               |
| **Supertest** | Tests HTTP       | `npm test`               |
| **ESLint**    | Linting          | `npm run lint`           |
| **Prettier**  | Formato          | `npm run format`         |
| **Prisma**    | BD + migraciones | `npx prisma migrate dev` |

---

## 14. Resumen: Día a Día

### Cuando Empiezas una Feature

```bash
git checkout develop
git pull origin develop
git checkout -b feature/miFeature

# Desarrollar...

npm test
npm run lint
npm run format

git commit -m "feat: descripción"
git push origin feature/miFeature

# Abre PR en GitHub
# Mergeea a develop cuando esté OK
```

### Cuando Haces Un Fix

```bash
git checkout develop
git checkout -b fix/miFix

# Corregir...

npm test
git commit -m "fix: descripción"
git push origin fix/miFix

# PR y merge
```

### Cuando Pasas a Producción (Release)

```bash
git checkout main
git merge develop
git tag v0.1.0
git push origin v0.1.0

# ¡Deployado!
```

---

## 15. Quick Reference: Commits en Orión

```bash
# Voz (Whisper + Kokoro.js)
git commit -m "feat(voice): implementa STT con Whisper"
git commit -m "feat(voice): implementa TTS con Kokoro.js"
git commit -m "test(voice): cubre casos de error"

# LLM (Ollama)
git commit -m "feat(llm): integra Ollama en localhost"
git commit -m "feat(llm): detecta intención de comandos"
git commit -m "fix(llm): maneja timeout de Ollama"

# Seguridad
git commit -m "feat(security): valida whitelist de comandos"
git commit -m "feat(security): rechaza comandos peligrosos"
git commit -m "test(security): cubre validaciones"

# BD y Modelos
git commit -m "feat(db): crea tablas de user_message e historial"
git commit -m "feat(model): queries para persistencia"

# API
git commit -m "feat(api): endpoint POST /api/voiceProcess"
git commit -m "feat(api): endpoint GET /api/history"

# Tests
git commit -m "test(integration): cubre flujo completo"
git commit -m "test(unit): agrega casos de borde"

# Docs
git commit -m "docs: actualiza README con ejemplos"
git commit -m "docs(architecture): explica flujo de voz"
```

---

## Conclusión

**Mantén simple:** comits claros, ramas por feature, tests básicos, y documentación.
