# API Documentation - Sistema de Gestión de Tareas

## Información General

- **Base URL:** `http://localhost:3000/api`
- **Autenticación:** JWT tokens almacenados en HTTP-only cookies firmadas
- **Formato de respuesta:** JSON
- **Versionado:** v1

## Autenticación

### POST /auth/register
Registrar un nuevo usuario en el sistema.

**Request Body:**
```json
{
  "email": "usuario@example.com",
  "password": "contraseña123"
}
```

**Response (201):**
```json
{
  "id": "uuid-123",
  "email": "usuario@example.com"
}
```

**Response (400) - Error:**
```json
{
  "error": "User with this email already exists"
}
```

### POST /auth/login
Iniciar sesión en el sistema.

**Request Body:**
```json
{
  "email": "usuario@example.com",
  "password": "contraseña123"
}
```

**Response (200):**
```json
{
  "id": "uuid-123",
  "email": "usuario@example.com"
}
```

**Response (400) - Datos faltantes:**
```json
{
  "error": "Email and password are required"
}
```

**Response (401) - Credenciales inválidas:**
```json
{
  "error": "Invalid credentials"
}
```

**Response (409) - Ya autenticado:**
```json
{
  "error": "User already logged in"
}
```

### POST /auth/logout
Cerrar sesión del usuario actual.

**Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

### GET /auth/me
Obtener información del usuario autenticado. Requiere autenticación.

**Response (200):**
```json
{
  "id": "uuid-123",
  "email": "usuario@example.com"
}
```

**Response (404):**
```json
{
  "error": "User not found"
}
```

### GET /auth/status
Verificar estado de autenticación sin requerir middleware.

**Response (200) - Autenticado:**
```json
{
  "isAuthenticated": true,
  "user": {
    "id": "uuid-123",
    "email": "usuario@example.com"
  }
}
```

**Response (200) - No autenticado:**
```json
{
  "isAuthenticated": false,
  "user": null
}
```

## Gestión de Tableros

### GET /boards
Obtener todos los tableros accesibles para el usuario. Requiere autenticación.

**Response (200):**
```json
{
  "boards": [
    {
      "id": "board-uuid-1",
      "name": "Proyecto Personal",
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

**Response (401):**
```json
"Unauthorized: User not authenticated"
```

### POST /boards
Crear un nuevo tablero. Requiere autenticación.

**Request Body:**
```json
{
  "name": "Nuevo Proyecto"
}
```

**Response (201):**
```json
"Board created"
```

**Response (400) - Nombre faltante:**
```json
"Board name is required"
```

**Response (400) - Nombre inválido:**
```json
"Invalid board name"
```

### GET /boards/:boardId
Obtener detalles de un tablero específico. Requiere autenticación y permisos.

**Response (200):**
```json
{
  "id": "board-uuid-1",
  "name": "Proyecto Personal",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

**Response (403):**
```json
"Forbidden: You do not have permission to access this board"
```

**Response (404):**
```json
"Board not found"
```

### DELETE /boards/:boardId
Eliminar un tablero. Requiere autenticación y permisos de propietario.

**Response (204):**
Sin contenido (eliminación exitosa)

**Response (403):**
```json
"Forbidden: You do not have permission to delete this board"
```

## Gestión de Tareas

### GET /tasks
Obtener tareas de un tablero específico. Requiere autenticación y permisos.

**Query Parameters:**
- `boardId` (requerido): ID del tablero
- `filter` (opcional): Filtro ('all', 'done', 'undone') - default: 'all'
- `page` (opcional): Número de página - default: "1"
- `limit` (opcional): Elementos por página - default: "10"

**Response (200):**
```json
{
  "tasks": [
    {
      "id": "task-uuid-1",
      "board_id": "board-uuid-1",
      "description": "Implementar autenticación con JWT",
      "completed": false,
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 1,
  "page": 1,
  "role": "owner"
}
```

**Response (403):**
```json
{
  "error": "You do not have permission to access the tasks in this board"
}
```

**Response (404):**
```json
{
  "error": "Board not found"
}
```

### GET /tasks/:id
Obtener una tarea específica por ID. Requiere autenticación y permisos.

**Response (200):**
```json
{
  "id": "task-uuid-1",
  "board_id": "board-uuid-1",
  "description": "Implementar autenticación con JWT",
  "completed": false,
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

**Response (404):**
```json
{
  "error": "Task not found"
}
```

**Response (403):**
```json
{
  "error": "Forbidden: You do not have permission to access this task"
}
```

### POST /tasks
Crear una nueva tarea. Requiere autenticación y permisos de edición.

**Request Body:**
```json
{
  "board_id": "board-uuid-1",
  "description": "Nueva tarea a completar"
}
```

**Response (201):**
```json
{
  "message": "Task created successfully"
}
```

**Response (400):**
```json
{
  "error": "Board ID and description are required"
}
```

**Response (403):**
```json
{
  "error": "Forbidden: You do not have permission to create tasks in this board"
}
```

### PUT /tasks/:id/description
Actualizar descripción de una tarea. Requiere autenticación y permisos de edición.

**Request Body:**
```json
{
  "description": "Tarea actualizada"
}
```

**Response (200):**
```json
{
  "message": "Task updated successfully"
}
```

**Response (400):**
```json
{
  "error": "Description is required"
}
```

### PUT /tasks/:id/toggle
Alternar estado de completado de una tarea. Requiere autenticación y permisos de edición.

**Response (200):**
```json
{
  "completed": true,
  "message": "Task completion toggled successfully"
}
```

**Response (400):**
```json
{
  "error": "Task ID is required"
}
```

### DELETE /tasks/:id
Eliminar una tarea. Requiere autenticación y permisos de edición.

**Response (200):**
```json
{
  "message": "Task deleted successfully"
}
```

**Response (403):**
```json
{
  "error": "Forbidden: You do not have permission to delete tasks in this board"
}
```

### DELETE /tasks/clear-completed
Eliminar todas las tareas completadas del tablero. Requiere autenticación y permisos de edición.

**Query Parameters:**
- `boardId` (requerido): ID del tablero

**Response (200):**
```json
{
  "message": "Completed tasks cleared successfully"
}
```

**Response (400):**
```json
{
  "error": "Board ID is required"
}
```

**Response (403):**
```json
{
  "error": "Forbidden: You do not have permission to clear completed tasks in this board"
}
```

## Gestión de Permisos

### POST /permissions/grant
Otorgar permisos a un usuario en un tablero. Requiere ser propietario del tablero.

**Request Body:**
```json
{
  "email": "colaborador@example.com",
  "boardId": "board-uuid-1",
  "role": "editor"
}
```

**Response (201):**
```json
{
  "message": "Permission granted successfully"
}
```

**Response (403):**
```json
{
  "error": "Forbidden: You do not have permission to grant permissions on this board"
}
```

### DELETE /permissions/revoke
Revocar permisos de un usuario en un tablero. Requiere ser propietario del tablero.

**Request Body:**
```json
{
  "userId": "uuid-456",
  "boardId": "board-uuid-1",
  "role": "editor"
}
```

**Response (200):**
```json
{
  "message": "Permission revoked successfully"
}
```

### GET /permissions/:boardId
Obtener todos los usuarios con permisos en un tablero. Requiere tener acceso al tablero.

**Response (200):**
```json
{
  "id": "permission-uuid-1",
  "user_id": "uuid-123",
  "board_id": "board-uuid-1",
  "role": "owner",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
},
{
  "id": "permission-uuid-2",
  "user_id": "uuid-456",
  "board_id": "board-uuid-1",
  "role": "editor",
  "created_at": "2024-01-15T13:00:00Z",
  "updated_at": "2024-01-15T13:00:00Z"
}
```

**Response (403):**
```json
{
  "error": "Forbidden: You do not have permission to view permissions for this board"
}
```

## Códigos de Estado HTTP

- **200 OK:** Solicitud exitosa
- **201 Created:** Recurso creado exitosamente
- **204 No Content:** Eliminación exitosa
- **400 Bad Request:** Datos de entrada inválidos
- **401 Unauthorized:** No autenticado
- **403 Forbidden:** Sin permisos suficientes
- **404 Not Found:** Recurso no encontrado
- **409 Conflict:** Conflicto con el estado actual (ej: ya autenticado)
- **500 Internal Server Error:** Error interno del servidor

## Tipos de Datos

### User
```typescript
{
  id: string;
  email: string;
  // password no se expone en las respuestas
}
```

### Board
```typescript
{
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}
```

### Task
```typescript
{
  id: string;
  board_id: string;
  description: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
}
```

### Permission
```typescript
{
  id: string;
  user_id: string;
  board_id: string;
  role: 'owner' | 'editor' | 'viewer';
  created_at: string;
  updated_at: string;
}
```

## Autenticación y Cookies

- **Cookie Name:** `token` (firmada)
- **HTTP Only:** `true`
- **Secure:** `true` en producción
- **Max Age:** 30 días
- **Signed:** `true` (requiere `COOKIE_SECRET`)

## Notas de Implementación

- Los campos `completed` en la base de datos SQLite se almacenan como números (0/1) pero se convierten a booleanos en las respuestas
- Las fechas se almacenan en formato ISO 8601
- Los IDs utilizan UUIDs para mayor seguridad
- Los roles disponibles son: `owner`, `editor`, `viewer`
- Muchas respuestas son strings simples sin wrapper JSON para errores/mensajes
- Las cookies están firmadas para mayor seguridad
- El endpoint `/auth/status` no requiere middleware de autenticación
