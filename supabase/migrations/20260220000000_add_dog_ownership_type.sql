-- Add ownership_type column to dogs table
-- Allows distinguishing between dogs we own vs external dogs (e.g., stud services)

ALTER TABLE dogs
ADD COLUMN ownership_type TEXT NOT NULL DEFAULT 'owned'
CHECK (ownership_type IN ('owned', 'external', 'stud_service', 'co_owned'));

-- Add comment for documentation
COMMENT ON COLUMN dogs.ownership_type IS 'Ownership status: owned (our dog), external (outside dog for lineage), stud_service (external stud), co_owned (shared ownership)';

-- Create index for filtering by ownership
CREATE INDEX idx_dogs_ownership_type ON dogs(ownership_type);
