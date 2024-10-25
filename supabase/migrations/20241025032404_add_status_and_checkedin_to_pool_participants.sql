-- migration_name: add_status_and_checkedin_to_pool_participants
ALTER TABLE pool_participants
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'JOINED',
ADD COLUMN IF NOT EXISTS checked_in_at TIMESTAMPTZ;

-- Crear un índice para mejorar el rendimiento de las consultas
CREATE INDEX IF NOT EXISTS idx_pool_participants_status ON pool_participants(pool_id, status);
