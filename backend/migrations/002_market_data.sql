-- Market data cache. Public, non-monetary: latest quote per asset, replaced on each refresh.
CREATE TABLE market_assets (
  symbol text PRIMARY KEY CHECK (symbol = upper(btrim(symbol))),
  name text NOT NULL,
  category text NOT NULL CHECK (category IN ('index', 'stock', 'forex', 'crypto', 'commodity')),
  provider text NOT NULL CHECK (provider IN ('coingecko', 'eodhd', 'massive')),
  provider_symbol text NOT NULL,
  enabled boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 100,
  UNIQUE (provider, provider_symbol)
);

CREATE TABLE market_snapshots (
  symbol text PRIMARY KEY REFERENCES market_assets(symbol) ON DELETE CASCADE,
  price numeric(24,8) NOT NULL,
  change_percent numeric(12,6),
  source_time timestamptz,
  fetched_at timestamptz NOT NULL DEFAULT now()
);

-- Per provider and UTC day: calls attempted (budget guard) and last completed run.
CREATE TABLE market_api_usage (
  provider text NOT NULL CHECK (provider IN ('coingecko', 'eodhd', 'massive')),
  day date NOT NULL,
  calls integer NOT NULL DEFAULT 0 CHECK (calls >= 0),
  last_run_at timestamptz,
  PRIMARY KEY (provider, day)
);

INSERT INTO market_assets (symbol, name, category, provider, provider_symbol, sort_order) VALUES
  ('BTC', 'Bitcoin', 'crypto', 'coingecko', 'bitcoin', 10),
  ('ETH', 'Ethereum', 'crypto', 'coingecko', 'ethereum', 11),
  ('SOL', 'Solana', 'crypto', 'coingecko', 'solana', 12),
  ('SPX', 'S&P 500', 'index', 'eodhd', 'GSPC.INDX', 20),
  ('DJI', 'Dow Jones', 'index', 'eodhd', 'DJI.INDX', 21),
  ('NDX', 'Nasdaq 100', 'index', 'eodhd', 'NDX.INDX', 22),
  ('EURUSD', 'EUR/USD', 'forex', 'eodhd', 'EURUSD.FOREX', 30),
  ('GBPUSD', 'GBP/USD', 'forex', 'eodhd', 'GBPUSD.FOREX', 31),
  ('USDJPY', 'USD/JPY', 'forex', 'eodhd', 'USDJPY.FOREX', 32),
  ('AAPL', 'Apple', 'stock', 'massive', 'AAPL', 40),
  ('MSFT', 'Microsoft', 'stock', 'massive', 'MSFT', 41),
  ('NVDA', 'NVIDIA', 'stock', 'massive', 'NVDA', 42),
  ('TSLA', 'Tesla', 'stock', 'massive', 'TSLA', 43);
