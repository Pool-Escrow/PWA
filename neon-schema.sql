-- Neon Database Schema for Goldsky Mirror Integration
-- Migration-compatible with existing Supabase schema

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types (matching current Supabase)
CREATE TYPE pool_roles AS ENUM ('mainHost', 'coHost', 'participant');
CREATE TYPE pool_status AS ENUM ('draft', 'unconfirmed', 'inactive', 'depositsEnabled', 'started', 'paused', 'ended', 'deleted');
CREATE TYPE user_roles AS ENUM ('user', 'admin');

-- Users table (core user data)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    display_name TEXT,
    avatar TEXT,
    role user_roles DEFAULT 'user' NOT NULL,
    privy_id TEXT UNIQUE NOT NULL,
    wallet_address VARCHAR(42) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pools table (enhanced for Mirror integration)
CREATE TABLE pools (
    internal_id SERIAL PRIMARY KEY,
    contract_id INTEGER UNIQUE, -- This will be populated by Mirror
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    banner_image TEXT,
    terms_url TEXT,
    soft_cap NUMERIC NOT NULL,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    price NUMERIC NOT NULL,
    token_address VARCHAR(42) NOT NULL,
    status pool_status DEFAULT 'draft' NOT NULL,
    code_of_conduct_url TEXT,
    required_acceptance BOOLEAN DEFAULT FALSE NOT NULL,
    
    -- Goldsky Mirror sync fields
    block_number BIGINT,
    transaction_hash VARCHAR(66),
    log_index INTEGER,
    synced_at TIMESTAMPTZ DEFAULT NOW(),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT check_dates CHECK (start_date < end_date),
    CONSTRAINT check_start_date CHECK (start_date > NOW()),
    CONSTRAINT pools_price_check CHECK (price >= 0),
    CONSTRAINT pools_soft_cap_check CHECK (soft_cap > 0)
);

-- Pool participants (enhanced for Mirror)
CREATE TABLE pool_participants (
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    pool_id INTEGER, -- References contract_id from pools table
    pool_role pool_roles DEFAULT 'participant' NOT NULL,
    status TEXT DEFAULT 'joined', -- For check-in status tracking
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Mirror sync fields
    block_number BIGINT,
    transaction_hash VARCHAR(66),
    log_index INTEGER,
    
    PRIMARY KEY (user_id, pool_id)
);

-- Pool metadata (IPFS integration)
CREATE TABLE pool_metadata (
    pool_id INTEGER PRIMARY KEY,
    ipfs_hash TEXT,
    metadata_json JSONB,
    banner_url TEXT,
    banner_ipfs_hash TEXT,
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pool winners (from contract events)
CREATE TABLE pool_winners (
    pool_id INTEGER NOT NULL,
    winner_address VARCHAR(42) NOT NULL,
    amount_won NUMERIC NOT NULL,
    amount_claimed NUMERIC DEFAULT 0,
    claimed BOOLEAN DEFAULT FALSE,
    forfeited BOOLEAN DEFAULT FALSE,
    
    -- Mirror sync fields
    block_number BIGINT,
    transaction_hash VARCHAR(66),
    log_index INTEGER,
    
    PRIMARY KEY (pool_id, winner_address)
);

-- Pool sponsors (from contract events)
CREATE TABLE pool_sponsors (
    pool_id INTEGER NOT NULL,
    sponsor_address VARCHAR(42) NOT NULL,
    sponsor_name TEXT,
    amount_sponsored NUMERIC NOT NULL,
    
    -- Mirror sync fields
    block_number BIGINT,
    transaction_hash VARCHAR(66),
    log_index INTEGER,
    
    PRIMARY KEY (pool_id, sponsor_address)
);

-- Session management (for auth)
CREATE TABLE sessions (
    session_token TEXT PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    expires TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Accounts (for OAuth/auth providers)
CREATE TABLE accounts (
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    provider TEXT NOT NULL,
    provider_account_id TEXT NOT NULL,
    refresh_token TEXT,
    access_token TEXT,
    expires_at INTEGER,
    token_type TEXT,
    scope TEXT,
    id_token TEXT,
    session_state TEXT,
    
    PRIMARY KEY (provider, provider_account_id)
);

-- Indexes for optimal performance
CREATE INDEX idx_pools_contract_id ON pools(contract_id);
CREATE INDEX idx_pools_status ON pools(status);
CREATE INDEX idx_pools_block_number ON pools(block_number);
CREATE INDEX idx_pools_token_address ON pools(token_address);
CREATE INDEX idx_pools_required_acceptance ON pools(required_acceptance);

CREATE INDEX idx_participants_pool_id ON pool_participants(pool_id);
CREATE INDEX idx_participants_user_id ON pool_participants(user_id);
CREATE INDEX idx_participants_role ON pool_participants(pool_role);
CREATE INDEX idx_participants_block_number ON pool_participants(block_number);

CREATE INDEX idx_winners_pool_id ON pool_winners(pool_id);
CREATE INDEX idx_winners_address ON pool_winners(winner_address);
CREATE INDEX idx_winners_claimed ON pool_winners(claimed);

CREATE INDEX idx_sponsors_pool_id ON pool_sponsors(pool_id);
CREATE INDEX idx_sponsors_address ON pool_sponsors(sponsor_address);

CREATE INDEX idx_metadata_ipfs_hash ON pool_metadata(ipfs_hash);

CREATE INDEX idx_users_wallet_address ON users(wallet_address);
CREATE INDEX idx_users_privy_id ON users(privy_id);

-- Row Level Security (RLS) policies
ALTER TABLE pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE pool_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;

-- Users can view all pools
CREATE POLICY "Allow users to view pools" ON pools FOR SELECT USING (true);

-- Users can participate in pools
CREATE POLICY "Allow users to participate in pools" ON pool_participants FOR INSERT WITH CHECK (true);

-- Users can view their own data
CREATE POLICY "Allow user to view own data" ON users FOR SELECT USING (true);

-- Users can update their own data
CREATE POLICY "Allow user to update own data" ON users FOR UPDATE USING ((current_setting('request.jwt.claims'::text, true)::json ->> 'sub'::text) = (id)::text);

-- Admins can create pools
CREATE POLICY "Allow admins to create pools" ON pools FOR INSERT WITH CHECK (((current_setting('request.jwt.claims'::text, true)::json ->> 'role'::text) = 'admin'::text));

-- Admins can update pools  
CREATE POLICY "Allow admins to update pools" ON pools FOR UPDATE USING (((current_setting('request.jwt.claims'::text, true)::json ->> 'role'::text) = 'admin'::text));

-- Session management policies
CREATE POLICY "Allow user to view own sessions" ON sessions FOR SELECT USING (((current_setting('request.jwt.claims'::text, true)::json ->> 'sub'::text) = (user_id)::text));
CREATE POLICY "Allow user to terminate own sessions" ON sessions FOR DELETE USING (((current_setting('request.jwt.claims'::text, true)::json ->> 'sub'::text) = (user_id)::text));

-- Account management policies  
CREATE POLICY "Allow user to view own accounts" ON accounts FOR SELECT USING (((current_setting('request.jwt.claims'::text, true)::json ->> 'sub'::text) = (user_id)::text));
CREATE POLICY "Allow user to update own accounts" ON accounts FOR UPDATE USING (((current_setting('request.jwt.claims'::text, true)::json ->> 'sub'::text) = (user_id)::text));

-- Grant permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres;

-- Comment on important tables and columns
COMMENT ON TABLE pools IS 'Main pools table with Mirror sync capabilities';
COMMENT ON COLUMN pools.contract_id IS 'Pool ID from smart contract, populated by Goldsky Mirror';
COMMENT ON COLUMN pools.block_number IS 'Block number when pool was created on-chain';
COMMENT ON COLUMN pools.transaction_hash IS 'Transaction hash of pool creation';

COMMENT ON TABLE pool_metadata IS 'IPFS metadata for pools including banner images';
COMMENT ON COLUMN pool_metadata.ipfs_hash IS 'IPFS hash of the complete metadata JSON';
COMMENT ON COLUMN pool_metadata.metadata_json IS 'Cached metadata from IPFS for faster queries';

COMMENT ON TABLE pool_participants IS 'Pool participants synced from contract events';
COMMENT ON COLUMN pool_participants.pool_id IS 'References contract_id from pools table';

COMMENT ON TABLE pool_winners IS 'Pool winners set by contract events';
COMMENT ON TABLE pool_sponsors IS 'Pool sponsors from contract sponsorship events'; 