-- v1_initial_Schema.sql
-- WARNING! DANGER! DESTRUCTIVE ACTIONS AHEAD!
-- Remove previous tables
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
    END LOOP;
END $$;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'roles') THEN
        DROP TYPE roles;
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'poolStatus') THEN
        DROP TYPE "poolStatus";
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'poolRoles') THEN
        DROP TYPE "poolRoles";
    END IF;
END $$;


-- Remove previous tables policies
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT nspname, relname, polname FROM pg_policy
        JOIN pg_class ON pg_class.oid = pg_policy.polrelid
        JOIN pg_namespace ON pg_namespace.oid = pg_class.relnamespace
        WHERE nspname = 'public'
    ) LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.polname) || ' ON ' || quote_ident(r.nspname) || '.' || quote_ident(r.relname);
    END LOOP;
END $$;

-- Create roles enum
CREATE TYPE "roles" AS ENUM ('user', 'admin');

-- Create Users table
CREATE TABLE IF NOT EXISTS "users" (
    -- Unique identifier for the user
    "id" int generated always as identity primary key,

    -- Display name of the user
    "displayName" text,

    -- Avatar image URL of the user
    "avatar" text,

    -- Role of the user (e.g. 'user', 'admin')
    "role" "roles" DEFAULT 'user' NOT NULL,

    -- Unique identifier for the user in Privy
    "privyId" text UNIQUE NOT NULL,

    -- Unique wallet address of the user
    "walletAddress" varchar(42) unique not null,

    -- Timestamp when the user was created
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT now(),

    -- Timestamp when the user was last updated
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create Accounts table
CREATE TABLE IF NOT EXISTS "accounts" ( -- maybe we can just use a table to save privy data, replacing this one
    "userId" int NOT NULL REFERENCES "users" ("id") ON DELETE cascade,
    "type" text NOT NULL,
    "provider" text NOT NULL,
    "providerAccountId" text NOT NULL,
    "refresh_token" text,
    "access_token" text,
    "expires_at" integer,
    "token_type" text,
    "scope" text,
    "id_token" text,
    "session_state" text,
    PRIMARY KEY ("provider", "providerAccountId")
);

-- Create Sessions table
CREATE TABLE IF NOT EXISTS "sessions" ( -- not sure how to use this one or if it is needed
    "sessionToken" text PRIMARY KEY NOT NULL,
    "userId" int NOT NULL REFERENCES "users" ("id") ON DELETE cascade,
    "expires" TIMESTAMP WITH TIME ZONE NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT now(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create enum for pool status
CREATE TYPE "poolStatus" AS ENUM (
    'draft',
    'unconfirmed',
    'inactive',
    'depositsEnabled',
    'started',
    'paused',
    'ended',
    'deleted'
);

-- Create Pools table
CREATE TABLE IF NOT EXISTS "pools" (

    -- Internal ID for the pool (used before smart contract deployment)
    "internal_id" int generated always as identity primary key,

    -- References the smart contract poolId (uint256)
    "contract_id" int UNIQUE,

    -- Pool name from the smart contract
    "name" text NOT NULL,

    -- Pool description, not present in the contract
    "description" text NOT NULL,

    -- Banner image URL of the Pool
    "bannerImage" text,

    -- URL to the pool terms, not present in the contract
    "termsURL" text NOT NULL,

    -- Soft cap of the pool, not present in the contract
    "softCap" numeric CHECK ("softCap" > 0),

    -- Database internals for auditing and logs purposes, TODO: make them auto-triggered
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT now(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now(),

    -- Start date from the smart contract
    "startDate" TIMESTAMP WITH TIME ZONE NOT NULL,

    -- End date from the smart contract
    "endDate" TIMESTAMP WITH TIME ZONE NOT NULL,

    -- Price from the smart contract
    "price" decimal NOT NULL CHECK (price >= 0),

    -- Token address from the smart contract
    "tokenAddress" varchar(42) unique not null,

    -- Internal status of the pool for the frontend (TODO: track updates and edits?)
    "status" "poolStatus" DEFAULT 'draft' NOT NULL
);

-- Add constraints to pools table
ALTER TABLE pools ADD CONSTRAINT check_dates CHECK ("startDate" < "endDate");
ALTER TABLE pools ADD CONSTRAINT check_start_date CHECK ("startDate" > now());

-- Create indexes for frequent queries
CREATE INDEX idx_pool_contract_id ON pools ("contract_id");
CREATE INDEX idx_pool_status ON pools ("status");

-- Create Pool roles enum
CREATE TYPE "poolRoles" AS ENUM ('mainHost', 'coHost', 'participant');

-- Create Pool Participants table
CREATE TABLE IF NOT EXISTS "pool_participants" (
    -- Unique identifier for the pool participant
    "user_id" int NOT NULL REFERENCES "users" ("id"),

    -- Reference to the internal_id of the pool
    "pool_id" int NOT NULL REFERENCES "pools" ("internal_id"),

    -- Role of the pool participant
    "poolRole" "poolRoles" NOT NULL,

    -- Timestamp when the pool participant was created
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT now(),

    PRIMARY KEY ("user_id", "pool_id")
);

-- Create index for querying participants of a pool
CREATE INDEX idx_pool_participants ON pool_participants ("pool_id", "poolRole");

-- Enable Row Level Security
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "accounts" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "sessions" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "pools" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "pool_participants" ENABLE ROW LEVEL SECURITY;

-- Create Policies
CREATE POLICY "Allow user to view own data" ON "users" FOR -- maybe we should just store sensitive data into different table and expose this table to everyone
SELECT
    USING (
        current_setting('request.jwt.claims', TRUE)::json ->> 'sub' = id::text
    );

CREATE POLICY "Allow user to update own data" ON "users"
FOR UPDATE
    USING (
        current_setting('request.jwt.claims', TRUE)::json ->> 'sub' = id::text
    );

CREATE POLICY "Allow user to view own accounts" ON "accounts" FOR
SELECT
    USING (
        current_setting('request.jwt.claims', TRUE)::json ->> 'sub' = "userId"::text
    );

CREATE POLICY "Allow user to update own accounts" ON "accounts"
FOR UPDATE
    USING (
        current_setting('request.jwt.claims', TRUE)::json ->> 'sub' = "userId"::text
    );

CREATE POLICY "Allow user to view own sessions" ON "sessions" FOR -- also admins should be able to view sessions?
SELECT
    USING (
        current_setting('request.jwt.claims', TRUE)::json ->> 'sub' = "userId"::text
    );

CREATE POLICY "Allow user to terminate own sessions" ON "sessions" FOR DELETE USING ( -- also admins should be able to terminate sessions?
    current_setting('request.jwt.claims', TRUE)::json ->> 'sub' = "userId"::text
);

CREATE POLICY "Allow admins to create pools" ON "pools" FOR INSERT
WITH
    CHECK (
        current_setting('request.jwt.claims', TRUE)::json ->> 'role' = 'admin'
    );

CREATE POLICY "Allow admins to update pools" ON "pools"
FOR UPDATE
    USING (
        current_setting('request.jwt.claims', TRUE)::json ->> 'role' = 'admin'
    );

CREATE POLICY "Allow users to view pools" ON "pools" FOR
SELECT
    USING (TRUE);

CREATE POLICY "Allow users to participate in pools" ON "pool_participants" FOR INSERT
WITH
    CHECK (TRUE);

-- Drop previous bucket
DELETE FROM storage.buckets
WHERE
    id = 'images';

-- Remove previous bucket policies
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT polname FROM pg_policy
        JOIN pg_class ON pg_class.oid = pg_policy.polrelid
        JOIN pg_namespace ON pg_namespace.oid = pg_class.relnamespace
        WHERE nspname = 'storage' AND relname = 'objects' AND polname LIKE '%Images%'
    ) LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.polname) || ' ON storage.objects';
    END LOOP;
END $$;

-- Create the storage bucket for images
-- Note: This part assumes supabase storage extension enabled
INSERT INTO
    storage.buckets (id, name, public)
VALUES
    ('images', 'images', TRUE);

-- Apply Row Level Security and policies for storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view avatar images
CREATE POLICY "Images: Allow anyone to view avatars" ON storage.objects FOR
SELECT
    USING (storage.filename (name) = 'avatar.png');

-- Allow anyone to view banner images
CREATE POLICY "Images: Allow anyone to view banners" ON storage.objects FOR
SELECT
    USING (storage.filename (name) = 'banner-image.png');

-- Allow users to upload their avatar.png to their specific folder
CREATE POLICY "Images: Allow users to upload avatar" ON storage.objects FOR INSERT TO authenticated
WITH
    CHECK (
        bucket_id = 'images'
        AND (storage.foldername (name)) [1] = current_setting('request.jwt.claims', TRUE)::json ->> 'sub'
        AND storage.filename (name) = 'avatar.png'
    );

-- Allow main-hosts to upload banner-image.png to the folder corresponding to the pool id
CREATE POLICY "Images: Allow main-hosts to upload banner" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
    bucket_id = 'images'
    AND (storage.foldername(name))[1] IN (
        SELECT
            pp.pool_id::text
        FROM
            pool_participants pp
        JOIN pools p ON pp.pool_id = p.internal_id
        WHERE
            pp.user_id::text = current_setting('request.jwt.claims', TRUE)::json ->> 'sub'
            AND pp."poolRole" = 'mainHost'
    )
    AND storage.filename(name) = 'banner-image.png'
);

DROP POLICY IF EXISTS "Images: Allow main hosts to update own banners" ON storage.objects;

-- Allow main hosts to update their own banner images
CREATE POLICY "Images: Allow main hosts to update own banners" ON storage.objects FOR UPDATE TO authenticated
    USING (
        current_setting('request.jwt.claims', TRUE)::json ->> 'sub' = owner_id::text
        AND storage.filename(name) = 'banner-image.png'
        AND bucket_id = 'images'
        AND (storage.foldername(name))[1] IN (
            SELECT pp.pool_id::text
            FROM pool_participants pp
            JOIN pools p ON pp.pool_id = p.internal_id
            WHERE pp.user_id::text = current_setting('request.jwt.claims', TRUE)::json ->> 'sub'
            AND pp."poolRole" = 'mainHost'
        )
    );

-- Allow main hosts to delete their own banner images
CREATE POLICY "Images: Allow main hosts to delete own banners" ON storage.objects FOR DELETE TO authenticated
    USING (
        current_setting('request.jwt.claims', TRUE)::json ->> 'sub' = owner_id::text
        AND storage.filename(name) = 'banner-image.png'
        AND bucket_id = 'images'
        AND (storage.foldername(name))[1] IN (
            SELECT pp.pool_id::text
            FROM pool_participants pp
            JOIN pools p ON pp.pool_id = p.internal_id
            WHERE pp.user_id::text = current_setting('request.jwt.claims', TRUE)::json ->> 'sub'
            AND pp."poolRole" = 'mainHost'
        )
    );

-- Allow users to update their own avatar
CREATE POLICY "Images: Allow user to update own avatar" ON storage.objects FOR UPDATE TO authenticated
    USING (
            current_setting('request.jwt.claims', TRUE)::json ->> 'sub' = owner_id::text
            AND storage.filename (name) = 'avatar.png'
        );

-- Allow users to delete their own avatar
CREATE POLICY "Images: Allow user to delete own avatar" ON storage.objects FOR DELETE TO authenticated
    USING (
        current_setting('request.jwt.claims', TRUE)::json ->> 'sub' = owner_id::text
        AND storage.filename (name) = 'avatar.png'
    );

-- Create a view to easily access pools with their main host
CREATE VIEW pools_with_main_host AS
SELECT p.*, pp.user_id AS main_host_id
FROM pools p
JOIN pool_participants pp ON p.internal_id = pp.pool_id AND pp."poolRole" = 'mainHost';

-- TRANSACTIONS: TODO:

-- -- 1. Create new user and account (No changes needed)
-- DO $$
-- DECLARE
--     user_id int;
-- BEGIN
--     INSERT INTO "users" ("displayName", "avatar", "role", "privyId", "walletAddress")
--     VALUES ($1, $2, $3, $4, $5)
--     RETURNING id INTO user_id;

--     INSERT INTO "accounts" ("userId", "type", "provider", "providerAccountId")
--     VALUES (user_id, $6, $7, $8);
-- END $$;

-- -- 2. Create a new pool
-- DO $$
-- DECLARE
--     pool_id int;
-- BEGIN
--     INSERT INTO "pools" ("name", "description", "bannerImage", "termsURL", "softCap", "hardCap", "startDate", "endDate", "price", "tokenAddress", "status")
--     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
--     RETURNING internal_id INTO pool_id;

--     INSERT INTO "pool_participants" ("user_id", "pool_id", "poolRole")
--     VALUES ($12, pool_id, 'mainHost');
-- END $$;

-- -- 3. Register a user as a participant in a pool
-- DO $$
-- BEGIN
--     INSERT INTO "pool_participants" ("user_id", "pool_id", "poolRole")
--     VALUES ($1, $2, 'participant');

--     UPDATE "pools"
--     SET "updatedAt" = NOW()
--     WHERE "internal_id" = $2;
-- END $$;

-- -- 4. Update a pool
-- DO $$
-- BEGIN
--     UPDATE "pools"
--     SET "name" = $2,
--         "description" = $3,
--         "bannerImage" = $4,
--         "termsURL" = $5,
--         "softCap" = $6,
--         "hardCap" = $7,
--         "startDate" = $8,
--         "endDate" = $9,
--         "price" = $10,
--         "tokenAddress" = $11,
--         "status" = $12,
--         "updatedAt" = NOW()
--     WHERE "internal_id" = $1;
-- END $$;

-- -- 5. Update the main host of a pool
-- DO $$
-- BEGIN
--     -- First, change the current main host to a co-host
--     UPDATE "pool_participants"
--     SET "poolRole" = 'coHost'
--     WHERE "pool_id" = $1 AND "poolRole" = 'mainHost';

--     -- Then, set the new main host
--     INSERT INTO "pool_participants" ("user_id", "pool_id", "poolRole")
--     VALUES ($2, $1, 'mainHost')
--     ON CONFLICT ("user_id", "pool_id") 
--     DO UPDATE SET "poolRole" = 'mainHost';

--     UPDATE "pools"
--     SET "updatedAt" = NOW()
--     WHERE "internal_id" = $1;
-- END $$;

-- -- 6. Remove a pool
-- DO $$
-- BEGIN
--     DELETE FROM "pool_participants"
--     WHERE "pool_id" = $1;

--     DELETE FROM "pools"
--     WHERE "internal_id" = $1;
-- END $$;


-- -- 7. Set contract_id for a pool after smart contract deployment
-- DO $$
-- BEGIN
--     UPDATE "pools"
--     SET "contract_id" = $2,
--         "status" = 'inactive',
--         "updatedAt" = NOW()
--     WHERE "internal_id" = $1;
-- END $$;