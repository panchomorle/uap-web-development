-- Crear tabla de permisos
CREATE TABLE permissions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  board_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('owner', 'editor', 'viewer')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  FOREIGN KEY (board_id) REFERENCES boards (id) ON DELETE CASCADE,
  UNIQUE(user_id, board_id)
);