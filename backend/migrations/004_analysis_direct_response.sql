-- El texto libre de Gemini no requiere una cotización externa para publicarse.
-- Localiza solo la restricción histórica de metadatos, sin alterar las demás.
DO $$
DECLARE metadata_constraint text;
BEGIN
  SELECT conname INTO STRICT metadata_constraint FROM pg_constraint
  WHERE conrelid = 'market_analyses'::regclass AND contype = 'c'
    AND pg_get_constraintdef(oid) LIKE '%market_source%';
  EXECUTE format('ALTER TABLE market_analyses DROP CONSTRAINT %I', metadata_constraint);
END $$;

ALTER TABLE market_analyses ADD CONSTRAINT market_analyses_published_metadata CHECK (
  status <> 'published' OR (generated_at IS NOT NULL AND model IS NOT NULL AND prompt_version IS NOT NULL)
);
