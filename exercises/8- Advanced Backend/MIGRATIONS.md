# 🗃️ Sistema de Migraciones

Este proyecto utiliza un sistema custom de migraciones para manejar cambios en la base de datos de manera versionada y controlada.

## 📁 Estructura

```
src/db/
├── migrator.ts              # Clase principal del sistema
├── migrate.ts               # CLI para ejecutar comandos
├── connection.ts            # Conexión a la base de datos
└── migrations/              # Archivos de migración
    ├── 001_create_users_table.sql
    ├── 001_create_users_table.rollback.sql
    ├── 002_create_boards_table.sql
    ├── 002_create_boards_table.rollback.sql
    └── ...
```

## 🚀 Comandos Disponibles

### Ejecutar todas las migraciones pendientes
```bash
npm run migrate:up
```

### Ver el estado de las migraciones
```bash
npm run migrate:status
```

### Hacer rollback de la última migración
```bash
npm run migrate:rollback
```

### Resetear completamente la base de datos
```bash
npm run migrate:reset
```

### Ayuda general
```bash
npm run migrate
```

## ⚙️ Configuración

### Variables de Entorno

Copia `.env.example` a `.env` y configura:

```bash
# Ejecutar migraciones automáticamente al iniciar la app
AUTO_MIGRATE=true
```

- **AUTO_MIGRATE=true**: Las migraciones se ejecutan automáticamente cuando inicias la aplicación
- **AUTO_MIGRATE=false**: Las migraciones deben ejecutarse manualmente

## 📝 Crear una Nueva Migración

### 1. Crear archivo de migración
```bash
# Formato: XXX_descripcion.sql (donde XXX es el número secuencial)
src/db/migrations/006_add_user_avatar.sql
```

### 2. Escribir el SQL
```sql
-- 006_add_user_avatar.sql
ALTER TABLE users ADD COLUMN avatar_url TEXT;
CREATE INDEX idx_users_avatar ON users(avatar_url);
```

### 3. Crear archivo de rollback (opcional pero recomendado)
```bash
src/db/migrations/006_add_user_avatar.rollback.sql
```

```sql
-- 006_add_user_avatar.rollback.sql
DROP INDEX IF EXISTS idx_users_avatar;
ALTER TABLE users DROP COLUMN avatar_url;
```

### 4. Ejecutar la migración
```bash
npm run migrate:up
```

## 🔄 Flujo de Trabajo Recomendado

### Para Desarrollo
```bash
# 1. Obtener cambios del repositorio
git pull

# 2. Ejecutar migraciones pendientes
npm run migrate:up

# 3. Iniciar desarrollo
npm run dev
```

### Para Nuevas Funcionalidades
```bash
# 1. Crear migración
# Crear archivo: 007_add_task_priority.sql

# 2. Ejecutar migración
npm run migrate:up

# 3. Desarrollar funcionalidad

# 4. Si algo sale mal, hacer rollback
npm run migrate:rollback
```

### Para Producción
```bash
# 1. Hacer backup de la base de datos
# 2. Ejecutar migraciones
npm run migrate:up

# 3. Verificar que todo funciona
npm run migrate:status
```

## 🛠️ Troubleshooting

### Error: "Migration already executed"
```bash
# Ver estado actual
npm run migrate:status

# Si necesitas re-ejecutar una migración:
npm run migrate:reset
npm run migrate:up
```

### Error de SQL en una migración
```bash
# Hacer rollback de la migración problemática
npm run migrate:rollback

# Corregir el archivo SQL
# Volver a ejecutar
npm run migrate:up
```

### Resetear completamente la base de datos
```bash
# ⚠️ CUIDADO: Esto elimina TODOS los datos
npm run migrate:reset
npm run migrate:up
```

## 📊 Ventajas de este Sistema

✅ **Versionado**: Cada cambio está numerado y versionado  
✅ **Reversible**: Cada migración puede deshacerse con rollback  
✅ **Automático**: Se ejecuta automáticamente en desarrollo  
✅ **Trazabilidad**: Sabes exactamente qué migraciones se ejecutaron  
✅ **Sincronización**: Todo el equipo tiene la misma estructura de BD  
✅ **Portable**: Funciona en desarrollo, staging y producción  

## 🎯 Casos de Uso Comunes

### Agregar una nueva tabla
```sql
-- 008_create_notifications_table.sql
CREATE TABLE notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);
```

### Modificar una tabla existente
```sql
-- 009_add_board_color.sql
ALTER TABLE boards ADD COLUMN color TEXT DEFAULT '#ffffff';
UPDATE boards SET color = '#ffffff' WHERE color IS NULL;
```

### Crear índices para performance
```sql
-- 010_add_performance_indexes.sql
CREATE INDEX idx_tasks_board_id ON tasks(board_id);
CREATE INDEX idx_tasks_completed ON tasks(completed);
CREATE INDEX idx_permissions_user_board ON permissions(user_id, board_id);
```

### Insertar datos iniciales
```sql
-- 011_insert_default_roles.sql
INSERT INTO roles (id, name, permissions) VALUES 
('owner', 'Owner', 'read,write,delete,admin'),
('editor', 'Editor', 'read,write'),
('viewer', 'Viewer', 'read');
```