-- Insertar datos de ejemplo
INSERT INTO boards (id, name) VALUES ('default', 'Tareas para la reconstrucción de Argentina');
INSERT INTO boards (id, name) VALUES ('ejemplo', 'Tareas para napoleón sapardo');

INSERT INTO tasks (id, board_id, description, completed) VALUES 
('1', 'default', 'Obtener recompensa por la captura de CFK', 0),
('2', 'default', 'Visitar la tumba de menem', 0),
('3', 'default', 'Liberar al patriarcado', 0),
('4', 'default', 'Descender de local contra belgrano con ventaja deportiva', 0),
('5', 'default', 'Colgar un cuadro de Karina Milei en la sala de casa', 1),
('6', 'default', 'Revivir a Cerati', 1),
('7', 'default', 'Descubrir un ser que jamás existió', 1),
('8', 'default', 'Duchar monos en la bañera', 1),
('9', 'default', 'Los sesos de frankenstein ver', 0),
('10', 'default', 'Construir un cohete', 0),
('11', 'default', 'Luchar contra una momia', 0),
('12', 'default', 'Escalar la Torre Eiffel', 0),
('13', 'default', 'Descubrir algo que no existe', 0),
('14', 'default', 'Darle a un mono una ducha', 0),
('15', 'default', 'Surcar una ola de marea', 0),
('16', 'default', 'Crear nanobots', 0),
('17', 'default', 'Localizar a Frankenstein', 0),
('18', 'default', 'Encontrar a un dodo', 0),
('19', 'default', 'Pintar un continente', 0),
('20', 'default', 'Destruir bolivia', 0);

INSERT INTO tasks (id, board_id, description, completed) VALUES 
('21', 'ejemplo', 'Ganarle al poderosísimo rayados de Monterrey :S', 0),
('22', 'ejemplo', 'Ganarle al Inter de lautoro', 0),
('23', 'ejemplo', 'Descender de local con ventaja deportiva', 1),
('24', 'ejemplo', 'Pegarle a un jugador', 1),
('25', 'ejemplo', 'Quemar la cancha', 1),
('26', 'ejemplo', 'Terminar la cancha con ayuda de Videlita', 1),
('27', 'ejemplo', 'Superar a bokita en el historial >:(', 0);