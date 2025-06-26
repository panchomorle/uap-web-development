-- Crear tabla de tareas
CREATE TABLE tasks (
  id TEXT PRIMARY KEY,
  board_id TEXT NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (board_id) REFERENCES boards (id) ON DELETE CASCADE
);