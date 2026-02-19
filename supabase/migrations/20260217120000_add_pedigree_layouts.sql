-- Create pedigree_layouts table for storing node positions
-- viewId can be 'default' for the main view or a rootDogId for dog-specific views

CREATE TABLE IF NOT EXISTS pedigree_layouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  view_id text NOT NULL DEFAULT 'default',
  node_id text NOT NULL, -- dog_id or litter_id prefixed with type (e.g., 'dog_xxx', 'litter_xxx')
  x double precision NOT NULL,
  y double precision NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(view_id, node_id)
);

-- Index for fast lookups by view_id
CREATE INDEX IF NOT EXISTS idx_pedigree_layouts_view_id ON pedigree_layouts(view_id);

-- Trigger to update updated_at on row update
CREATE OR REPLACE FUNCTION update_pedigree_layouts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_pedigree_layouts_updated_at ON pedigree_layouts;
CREATE TRIGGER trigger_update_pedigree_layouts_updated_at
  BEFORE UPDATE ON pedigree_layouts
  FOR EACH ROW
  EXECUTE FUNCTION update_pedigree_layouts_updated_at();

-- RLS policies (if needed - adjust based on your auth setup)
ALTER TABLE pedigree_layouts ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all layouts
CREATE POLICY "Allow read pedigree_layouts"
  ON pedigree_layouts
  FOR SELECT
  TO authenticated, anon
  USING (true);

-- Allow authenticated users to insert/update layouts
CREATE POLICY "Allow insert pedigree_layouts"
  ON pedigree_layouts
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow update pedigree_layouts"
  ON pedigree_layouts
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to delete layouts
CREATE POLICY "Allow delete pedigree_layouts"
  ON pedigree_layouts
  FOR DELETE
  TO authenticated
  USING (true);
