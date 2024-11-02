-- migration_name: replace_constraint_with_trigger

-- Remove the existing constraint
ALTER TABLE pools DROP CONSTRAINT IF EXISTS check_start_date;

-- Create a function for the trigger
CREATE OR REPLACE FUNCTION check_start_date_on_insert()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW."startDate" <= CURRENT_DATE THEN
    RAISE EXCEPTION 'New events must have a future start date';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger that only fires on INSERT
CREATE TRIGGER enforce_future_start_date_on_insert
BEFORE INSERT ON pools
FOR EACH ROW
EXECUTE FUNCTION check_start_date_on_insert();

-- Comment: This migration removes the check_start_date constraint and replaces it with a trigger
-- that ensures new entries have a future start date. The trigger only applies to new insertions,
-- allowing existing entries to keep their dates.