-- migration_name: add_conduct_and_acceptance_to_pool
ALTER TABLE pools
ADD COLUMN IF NOT EXISTS code_of_conduct_url TEXT,
ADD COLUMN IF NOT EXISTS required_acceptance BOOLEAN NOT NULL DEFAULT false;

-- Create an index to improve the performance of queries that filter by required_acceptance
CREATE INDEX IF NOT EXISTS idx_pools_required_acceptance ON pools(required_acceptance);

-- Comment: This migration adds two new fields to the pools table:
-- 1. code_of_conduct_url: An optional text field to store the URL of the code of conduct.
-- 2. required_acceptance: A boolean field indicating whether acceptance of the code of conduct is required.
--    It is set to false by default to maintain compatibility with existing pools.

-- The index on required_acceptance will improve the performance of queries that filter pools
-- based on whether they require acceptance or not.
