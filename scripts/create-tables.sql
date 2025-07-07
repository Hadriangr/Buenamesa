-- Crear tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    rut VARCHAR(12) UNIQUE NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    curso VARCHAR(100) NOT NULL,
    bloqueado BOOLEAN DEFAULT FALSE,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de tickets
CREATE TABLE IF NOT EXISTS tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL,
    rut VARCHAR(12) NOT NULL,
    fecha_emision DATE NOT NULL,
    hora_emision TIME NOT NULL,
    fecha_hora_completa DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    UNIQUE(rut, fecha_emision)
);

-- Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_usuarios_rut ON usuarios(rut);
CREATE INDEX IF NOT EXISTS idx_tickets_rut_fecha ON tickets(rut, fecha_emision);
CREATE INDEX IF NOT EXISTS idx_tickets_fecha ON tickets(fecha_emision);
