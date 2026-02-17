-- Add custom parent name fields to litters table
-- Allows specifying external sires/dams not in the dogs table

ALTER TABLE litters
ADD COLUMN IF NOT EXISTS custom_sire_name TEXT,
ADD COLUMN IF NOT EXISTS custom_dam_name TEXT;

-- Add comment explaining usage
COMMENT ON COLUMN litters.custom_sire_name IS 'Name of external sire (used when sire is not in dogs table)';
COMMENT ON COLUMN litters.custom_dam_name IS 'Name of external dam (used when dam is not in dogs table)';
