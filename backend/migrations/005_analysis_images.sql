-- Imágenes ilustrativas por escenario. El binario vive en un almacenamiento externo
-- (disco local hoy, nube más adelante); aquí solo la clave y el estado.
CREATE TABLE analysis_images (
  analysis_date date NOT NULL REFERENCES market_analyses(analysis_date) ON DELETE CASCADE,
  scenario char(1) NOT NULL CHECK (scenario IN ('A', 'B')),
  status text NOT NULL CHECK (status IN ('ready', 'failed')),
  storage_key text,
  mime_type text,
  error_message text,
  model text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (analysis_date, scenario),
  CHECK (status <> 'ready' OR (storage_key IS NOT NULL AND mime_type IS NOT NULL))
);
