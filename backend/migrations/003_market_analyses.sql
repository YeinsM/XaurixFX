CREATE TABLE market_analyses (
  analysis_date date PRIMARY KEY,
  status text NOT NULL CHECK (status IN ('published', 'insufficient_data', 'failed')),
  report jsonb CHECK (report IS NULL OR jsonb_typeof(report) = 'object'),
  sources jsonb NOT NULL CHECK (jsonb_typeof(sources) = 'object'),
  market_source text,
  reference_price text,
  reference_at timestamptz,
  generated_at timestamptz,
  model text,
  prompt_version text,
  error_code text CHECK (error_code IS NULL OR error_code ~ '^[a-z][a-z0-9_]{0,63}$'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK ((status = 'published' AND report IS NOT NULL) OR (status <> 'published' AND report IS NULL)),
  CHECK (status <> 'published' OR (
    market_source IS NOT NULL AND reference_price IS NOT NULL AND reference_at IS NOT NULL
    AND generated_at IS NOT NULL AND model IS NOT NULL AND prompt_version IS NOT NULL
  )),
  CHECK ((status = 'failed' AND error_code IS NOT NULL) OR (status <> 'failed' AND error_code IS NULL))
);

CREATE INDEX market_analyses_date_desc_idx ON market_analyses (analysis_date DESC);
