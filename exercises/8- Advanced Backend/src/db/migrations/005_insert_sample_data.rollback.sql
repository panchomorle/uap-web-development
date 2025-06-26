-- Rollback para 005_insert_sample_data.sql
DELETE FROM tasks WHERE board_id = 'default';
DELETE FROM boards WHERE id = 'default';