-- migration_name: remove_code_of_conduct

-- Remove data from code_of_conduct_url column
UPDATE pools
SET code_of_conduct_url = NULL
WHERE code_of_conduct_url IS NOT NULL;

-- Remove the code_of_conduct_url column
ALTER TABLE pools DROP COLUMN IF EXISTS code_of_conduct_url;

-- Comment: This migration removes the code_of_conduct_url column from the pools table.
-- First, it updates any existing entries to set the code_of_conduct_url to NULL.
-- Then, it drops the column from the table structure.