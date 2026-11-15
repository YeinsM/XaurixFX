-- EODHD bills one call per ticker (20/day on the free plan), so it keeps only the index symbols.
-- Forex moves to Massive (Currencies Basic, end-of-day, 5 calls/minute).
UPDATE market_assets SET provider = 'massive', provider_symbol = 'C:' || symbol WHERE category = 'forex';
