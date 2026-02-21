-- Add owner_name column to dogs table
-- Stores the name of the owner/kennel for external dogs

ALTER TABLE dogs
ADD COLUMN owner_name TEXT;

-- Add comment for documentation
COMMENT ON COLUMN dogs.owner_name IS 'Name of owner or kennel, especially useful for external dogs (e.g., "Smith Kennels")';
