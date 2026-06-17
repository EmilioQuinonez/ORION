# SETUP E INSTALACIÓN - Proyecto Orión

**Proyecto:** Orión MVP 1  
**Tiempo Estimado:** 30-45 minutos  
**Costo:** $0  
**Complejidad:** Bajo-Medio

---

## 1. Requisitos Previos

### Hardware Mínimo

- **RAM:** 8GB (12GB recomendado para Ollama)
- **Disco:** 20GB libres (10GB para modelos)
- **CPU:** 2+ cores (4+ cores mejor)
- **Micrófono + Parlantes:** USB funciona

### Software Requerido

```bash
# macOS
Node.js 18+
PostgreSQL 14+
Git
Ollama (para modelos LLM)

# Windows/Linux
Node.js 18+
PostgreSQL 14+
Git
Ollama (para modelos LLM)
```

---

## 2. Paso a Paso de Instalación

### Paso 1: Instalar Node.js (5 minutos)

#### macOS

```bash
# Opción 1: Homebrew (recomendado)
brew install node

# Opción 2: Descargar
# https://nodejs.org/
# Descargar LTS 18+
```

#### Windows

```bash
# Opción 1: Installer directo
# https://nodejs.org/
# Descargar .msi

# Opción 2: Chocolatey
choco install nodejs
```

#### Linux (Ubuntu/Debian)

```bash
curl -sL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

**Verificar:**

```bash
node --version   # v18.x.x o superior
npm --version    # 9.x.x o superior
```

---

### Paso 2: Instalar PostgreSQL (5 minutos)

#### macOS

```bash
# Homebrew
brew install postgresql

# Iniciar servicio
brew services start postgresql

# Verificar
psql --version
```

#### Windows

```bash
# Descargar installer desde:
# https://www.postgresql.org/download/windows/
# Ejecutar y seguir instrucciones

# Verificar en PowerShell
psql --version
```

#### Linux (Ubuntu/Debian)

```bash
sudo apt update
sudo apt install -y postgresql postgresql-contrib

sudo systemctl start postgresql
sudo systemctl enable postgresql

# Verificar
psql --version
```

**Crear BD:**

```bash
# Conectar a PostgreSQL
psql postgres

# Dentro de psql:
CREATE USER orion WITH PASSWORD 'password';
CREATE DATABASE orion OWNER orion;
GRANT ALL PRIVILEGES ON DATABASE orion TO orion;
\q

# Verificar conexión
psql -U orion -d orion -c "SELECT 1;"
```

---

### Paso 3: Instalar Ollama (5 minutos)

Ollama proporciona el modelo de IA local (Qwen 3.5 9B).

#### macOS

```bash
# Opción 1: Homebrew
brew install ollama

# Opción 2: Descargar directamente
# https://ollama.ai
```

#### Windows

```bash
# Descargar desde https://ollama.ai
# Ejecutar installer
# Ollama se ejecutará en background automáticamente
```

#### Linux (Ubuntu/Debian)

```bash
# Descarga automática
curl -fsSL https://ollama.ai/install.sh | sh

# Iniciar servicio
sudo systemctl start ollama
sudo systemctl enable ollama
```

**Verificar Ollama:**

```bash
# En terminal separada
ollama serve

# Debe mostrar:
# Listening on 127.0.0.1:11434
```

---

### Paso 4: Clonar Repositorio (2 minutos)

```bash
# Clonar
git clone https://github.com/EmilioQuinonez/orion.git
cd orion

# Verificar estructura
ls -la
# Debe tener: src/, prisma/, tests/, package.json, etc.
```

---

### Paso 5: Instalar Dependencias Node (10 minutos)

```bash
# Instalar todas las dependencias
npm install

# Esto incluye:
# - Express
# - Prisma
# - TypeScript
# - Whisper (node-whisper)
# - Piper (piper-tts)
# - Jest (testing)
# - Y más...
```

**Si hay problemas:**

```bash
# Limpiar caché
npm cache clean --force

# Reinstalar
rm -rf node_modules package-lock.json
npm install
```

---

### Paso 6: Configurar Variables de Entorno (3 minutos)

```bash
# Copiar template
cp .env.example .env

# Editar con tus valores
nano .env  # o tu editor favorito
```

**Contenido de .env:**

```env
# ========== BASE DE DATOS ==========
DATABASE_URL="postgresql://orion:password@localhost:5432/orion"

# ========== SERVER ==========
PORT=3000
NODE_ENV="development"

# ========== OLLAMA (LLM Local) ==========
OLLAMA_URL="http://localhost:11434"
OLLAMA_MODEL="qwen3.5:9b"
# Modelo principal: Qwen 3.5 9B

# ========== CLAUDE API (Opcional - MVP 2+) ==========
# CLAUDE_API_KEY="sk-ant-..."

# ========== LOGGING ==========
LOG_LEVEL="debug"

# ========== AUDIO ==========
MICROPHONE_DEVICE_INDEX=0
# Si tienes múltiples micrófonos, cambia el número
```

---

### Paso 7: Inicializar Base de Datos (5 minutos)

```bash
# Generar cliente Prisma
npx prisma generate

# Crear tablas (migraciones)
npx prisma migrate dev --name init

# Cuando pregunte "Enter name for new migration"
# Responde: init

# Verificar BD (opcional, abre interfaz visual)
npx prisma studio
# Abre http://localhost:5555
```

---

### Paso 8: Descargar Modelos (10-30 minutos)

Los modelos se descargan automáticamente cuando se usan por primera vez.

#### Whisper (STT)

```bash
# Se descarga automáticamente con npm install
# Tamaño: ~140MB
# Primera ejecución: tarda 1-2 minutos

# Manual (si quieres pre-descargar):
# No necesario - npm install ya lo hace
```

#### Ollama Models

```bash
# En terminal separada (donde corre ollama serve):

# Descargar Qwen 3.5 9B (modelo principal)
ollama pull qwen3.5:9b
# Tamaño: ~4GB, tarda 5-15 minutos

# Alternativas (para futuro):
ollama pull llama2        # 7B model
ollama pull neural-chat   # 7B optimizado para chat

# Verificar que descargó
ollama list
```

**IMPORTANTE:** Mantén `ollama serve` corriendo en terminal separada durante todo el desarrollo.

---

### Paso 9: Verificar Instalación (5 minutos)

```bash
# 1. Node.js
node --version          # v18.x.x +
npm --version           # 9.x.x +

# 2. PostgreSQL
psql -U orion -d orion -c "SELECT 1;"
# Response: 1

# 3. Ollama
curl http://localhost:11434/api/tags
# Response: JSON con modelos descargados

# 4. Whisper (test)
npm run test -- whisper.test.ts

# 5. npm scripts disponibles
npm run
# Debe listar scripts: dev, build, test, etc
```

---

### Paso 10: Correr la Aplicación (2 minutos)

#### Terminal 1: Ollama (mantener abierto)

```bash
ollama serve

# Debe mostrar:
# Listening on 127.0.0.1:11434
```

#### Terminal 2: Servidor Node

```bash
npm run dev

# Debe mostrar:
# ✓ Server running on http://localhost:3000
# ✓ Database connected
# ✓ Ollama API ready
```

#### Terminal 3: Tests (opcional)

```bash
npm test

# Todos los tests deben pasar
```

---

## 3. Primera Ejecución

### Acceder a la App

```
Abre en navegador: http://localhost:3000
```

### Probar un Comando

```
"Orión, ¿qué hora es?"

Resultado esperado:
├─ Escucha tu voz
├─ Transcribe a texto
├─ Procesa con Ollama
├─ Responde por voz
└─ Guarda en BD
```

---

## 4. Troubleshooting

### Error: "Port 3000 already in use"

```bash
# Encontrar qué ocupa el puerto
lsof -i :3000

# Matar proceso
kill -9 <PID>

# O cambiar puerto en .env
PORT=3001
```

### Error: "PostgreSQL connection refused"

```bash
# Verificar si está corriendo
brew services list  # macOS
sudo systemctl status postgresql  # Linux

# Iniciar si está detenido
brew services start postgresql
sudo systemctl start postgresql
```

### Error: "Ollama not responding"

```bash
# ¿Está la terminal con ollama serve?
# Si no, en otra terminal:
ollama serve

# Verificar que responde:
curl http://localhost:11434/api/tags
```

### Error: "Cannot find module 'node-whisper'"

```bash
# Reinstalar
npm install node-whisper

# Si sigue fallando:
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Error: "Micrófono no funciona"

```bash
# Listar dispositivos
npm run list-devices

# Cambiar en .env si tienes múltiples
MICROPHONE_DEVICE_INDEX=1
```

### Error: "Prisma schema out of sync"

```bash
# Sincronizar
npx prisma migrate dev

# O crear nueva migración
npx prisma migrate dev --name name_of_migration
```

---

## 5. Estructura Post-Setup

```
orion/
│
├── src/
│   ├── index.js                      # Express server (punto de entrada)
│   │
│   ├── router/
│   │
│   ├── controller/
│   │
│   ├── service/
│   │
│   ├── model/
│   │
│   ├── middleware/
│   │
│   ├── policies/
│   │
│   ├── schemas/                      # Validación Zod (MVP 2+)
│   │
│   ├── utils/
│   │
│   ├── config.ts                     # Variables de entorno
│   ├── db.ts                         # Pool PostgreSQL (opcional MVP 1)
│   └── prisma.ts                     # Cliente Prisma
│
├── prisma/
│   ├── schema.prisma                 # Definición de BD
│   └── migrations/                   # Primera migración
│
├── tests/
│   ├── unit/
│   │
│   └── integration/
│
├── docs/
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

## 6. Próximas Sesiones (Volviendo después de pausar)

### Checklist Rápido

```bash
# Terminal 1: Ollama (CRÍTICO - nunca cierres)
ollama serve

# Terminal 2: Servidor
npm run dev

# Debe mostrar:
✓ Server running on http://localhost:3000
✓ Database connected
✓ Ollama API ready

# Terminal 3: (opcional) Tests
npm test
```

### Si Algo Falló

```bash
# Resetear todo
npm run db:reset        # BD limpia
npm run clean           # Limpia node_modules
npm install             # Reinstala
npm run dev             # Reinicia
```

---

## 7. Scripts Útiles

### Desarrollo

```bash
npm run dev              # Correr servidor con auto-reload
npm run build            # Build para producción
npm start                # Correr versión producción

npm test                 # Tests
npm test:watch           # Tests con watch mode
npm test:coverage        # Tests + cobertura
```

### Base de Datos

```bash
npx prisma studio       # Ver BD visualmente
npx prisma migrate dev  # Nueva migración
npx prisma migrate reset # Resetear BD
npx prisma generate     # Regenerar cliente
```

### Linting

```bash
npm run lint             # Verificar código
npm run format           # Formatear código
npm run type-check       # Chequear tipos TypeScript
```

---

## 8. Validación de Setup

### Checklist Final

- [ ] Node.js 18+
- [ ] PostgreSQL corriendo
- [ ] Ollama corriendo (ollama serve)
- [ ] npm install sin errores
- [ ] npx prisma migrate dev completó
- [ ] npm test pasa todos
- [ ] npm run dev muestra "Server running"
- [ ] curl http://localhost:3000/api/health retorna {"status":"ok"}
- [ ] curl http://localhost:11434/api/tags retorna JSON

**Cuando TODO esté ✅, ¡setup completado!**

---

## 9. Costo Total

```
Node.js:           $0 (gratis)
PostgreSQL:        $0 (open source)
Ollama:            $0 (open source)
Whisper:           $0 (gratis OpenAI)
Piper:             $0 (open source)
TypeScript:        $0 (gratis)
Total:             $0
```

---

**Setup completado.**

Para preguntas, consulta los otros documentos:

- 01-VISION.md (qué es Orión)
- 02-SRS.md (requisitos)
- 03-ARQUITECTURA.md (cómo está hecho)
- 05-PLAN-CALIDAD.md (cómo testear)
