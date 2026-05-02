-- ================================
-- EXTENSIONS
-- ================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================
-- USERS
-- ================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE,
  password TEXT,
  google_id TEXT UNIQUE,
  avatar TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);

-- ================================
-- WALLETS
-- ================================
CREATE TABLE wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  balance BIGINT NOT NULL DEFAULT 1000 CHECK (balance >= 0),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_wallet_user ON wallets(user_id);

-- ================================
-- TRANSACTIONS
-- ================================
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  amount BIGINT NOT NULL,
  type TEXT NOT NULL CHECK (
    type IN ('bet', 'win', 'loss', 'refund', 'bonus')
  ),
  reference_id UUID,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_created ON transactions(created_at DESC);

-- ================================
-- GAME ROUNDS (CRASH)
-- ================================
CREATE TABLE game_rounds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  crash_point FLOAT NOT NULL,
  hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  status TEXT NOT NULL CHECK (
    status IN ('waiting', 'running', 'crashed')
  ),
  started_at TIMESTAMP,
  crashed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_round_status ON game_rounds(status);
CREATE INDEX idx_round_created ON game_rounds(created_at DESC);

-- ================================
-- BETS
-- ================================
CREATE TABLE bets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  round_id UUID REFERENCES game_rounds(id),
  amount BIGINT NOT NULL CHECK (amount > 0),
  cashout_multiplier FLOAT,
  payout BIGINT,
  status TEXT NOT NULL CHECK (
    status IN ('pending', 'won', 'lost')
  ),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_bets_user ON bets(user_id);
CREATE INDEX idx_bets_round ON bets(round_id);
CREATE INDEX idx_bets_status ON bets(status);

-- Composite index (important for queries)
CREATE INDEX idx_bets_user_round ON bets(user_id, round_id);

-- ================================
-- SESSIONS
-- ================================
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  refresh_token TEXT NOT NULL,
  user_agent TEXT,
  ip_address TEXT,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_sessions_token ON sessions(refresh_token);

-- ================================
-- OPTIONAL: LEADERBOARD VIEW
-- ================================
CREATE MATERIALIZED VIEW leaderboard AS
SELECT 
  u.id,
  u.username,
  w.balance
FROM users u
JOIN wallets w ON u.id = w.user_id
ORDER BY w.balance DESC;

-- Refresh manually when needed
-- REFRESH MATERIALIZED VIEW leaderboard;

-- ================================
-- OPTIONAL: TRIGGER (auto update wallet timestamp)
-- ================================
CREATE OR REPLACE FUNCTION update_wallet_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_wallet_updated
BEFORE UPDATE ON wallets
FOR EACH ROW
EXECUTE FUNCTION update_wallet_timestamp();

ALTER TABLE transactions
DROP CONSTRAINT transactions_type_check;

ALTER TABLE transactions
ADD CONSTRAINT transactions_type_check CHECK (
  type IN (
    'bet',
    'win',
    'loss',
    'refund',
    'bonus',

    -- 🔥 NEW
    'coin_earn',
    'pool_entry',
    'pool_reward'
  )
);

CREATE TABLE pools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('lucky_draw')),
  entry_fee BIGINT NOT NULL CHECK (entry_fee > 0),
  total_pool BIGINT DEFAULT 0,
  max_winners INTEGER DEFAULT 1,
  status TEXT NOT NULL CHECK (status IN ('active', 'ended')),
  start_at TIMESTAMP NOT NULL,
  end_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE pool_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pool_id UUID REFERENCES pools(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),

  -- prevent spam
  UNIQUE(pool_id, user_id)
);

CREATE INDEX idx_pool_status ON pools(status);
CREATE INDEX idx_pool_time ON pools(start_at, end_at);

CREATE INDEX idx_pool_entries_pool ON pool_entries(pool_id);
CREATE INDEX idx_pool_entries_user ON pool_entries(user_id);