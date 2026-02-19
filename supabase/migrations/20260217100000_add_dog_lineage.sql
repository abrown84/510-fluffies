-- Add sire_id and dam_id to dogs table for multi-generational tracking
-- This allows tracking a dog's parents (as dogs in the system)

ALTER TABLE dogs
ADD COLUMN IF NOT EXISTS sire_id UUID REFERENCES dogs(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS dam_id UUID REFERENCES dogs(id) ON DELETE SET NULL;

-- Create indexes for efficient lineage queries
CREATE INDEX IF NOT EXISTS idx_dogs_sire_id ON dogs(sire_id);
CREATE INDEX IF NOT EXISTS idx_dogs_dam_id ON dogs(dam_id);

-- Add comments for documentation
COMMENT ON COLUMN dogs.sire_id IS 'Reference to the father dog (male parent)';
COMMENT ON COLUMN dogs.dam_id IS 'Reference to the mother dog (female parent)';
