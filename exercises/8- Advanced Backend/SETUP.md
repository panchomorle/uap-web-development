# Configuración - Backend Avanzado

## Requisitos Previos

- **Node.js** (versión 18.0.0 o superior)
- **npm** (versión 8.0.0 o superior)

## 1. Instalar Dependencias

```bash
npm install
```

## 2. Configuración de Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```bash
# .env
# DB Configuration
AUTO_MIGRATE=true
# JWT Secret to sign tokens
JWT_SECRET=supersecretkey123

# port where the server will run
PORT=3000
# URL of the frontend application
FRONTEND_URL=http://localhost:5173
# Environment mode
NODE_ENV=development
```

### Variables de Entorno

- `AUTO_MIGRATE`: Establece en `true` para ejecutar migraciones al iniciar
- `JWT_SECRET`: Clave secreta para JWT
- `PORT`: Puerto del servidor (3000)
- `FRONTEND_URL`: URL del frontend para CORS
- `NODE_ENV`: Para cambiar el entorno en el que se ejecuta 

## 3. Poblar Base de Datos

Para poblar la base de datos con datos de ejemplo, asegúrate de que `POPULATE_DB=true` en tu archivo `.env` antes de iniciar el servidor por primera vez.

Los datos incluyen:
- Tablero por defecto: "Tareas para la reconstrucción de Argentina"
- 20 tareas de ejemplo (algunas completadas, otras pendientes)

## 4. Ejecutar el Proyecto

```bash
# Modo desarrollo
npm run dev
```

El servidor se iniciará en: `http://localhost:3001`

## 5. Limpiar Base de Datos

Para limpiar completamente la base de datos:

```bash
npm run cleanup
```

## 6. Estructura del Proyecto

```
src/
├── modules/             # Módulos por funcionalidad
│   ├── auth/           # Autenticación
│   ├── boards/         # Gestión de tableros
│   └── tasks/          # Gestión de tareas
├── middleware/         # Middlewares
├── db/                # Base de datos
└── index.ts           # Punto de entrada
```

## 7. Probar la API

```bash
# Verificar servidor
curl http://localhost:3001/

# Obtener tableros
curl http://localhost:3001/api/boards

# Obtener tareas del tablero por defecto
curl http://localhost:3001/api/boards/default/tasks
```
