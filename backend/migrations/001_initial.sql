CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(100) NOT NULL CHECK (length(btrim(name)) BETWEEN 2 AND 100),
  email varchar(254) NOT NULL UNIQUE CHECK (email = lower(btrim(email))),
  password_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Exact high-scale decimal placeholders, not a crypto ledger or approved accounting policy.
-- The application has no route that credits/debits these values.
CREATE TABLE accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES users(id) ON DELETE RESTRICT,
  currency text NOT NULL DEFAULT 'USD' CHECK (currency = 'USD'),
  balance numeric(38,18) NOT NULL DEFAULT 0 CHECK (balance >= 0),
  principal numeric(38,18) NOT NULL DEFAULT 0 CHECK (principal >= 0),
  profit numeric(38,18) NOT NULL DEFAULT 0,
  return_percent numeric(20,10),
  participation_percent numeric(20,10) CHECK (participation_percent BETWEEN 0 AND 100),
  valuation_at timestamptz,
  target_date date,
  status text NOT NULL DEFAULT 'pending_integration' CHECK (status = 'pending_integration'),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE sessions (
  token_hash char(64) PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz
);
CREATE INDEX sessions_user_id_idx ON sessions(user_id);
CREATE INDEX sessions_expires_at_idx ON sessions(expires_at);
