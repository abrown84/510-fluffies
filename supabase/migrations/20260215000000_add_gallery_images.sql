-- Add dog_images table if it doesn't exist
CREATE TABLE IF NOT EXISTS dog_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dog_id UUID REFERENCES dogs(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add litter_images table if it doesn't exist
CREATE TABLE IF NOT EXISTS litter_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  litter_id UUID REFERENCES litters(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_dog_images_dog_id ON dog_images(dog_id);
CREATE INDEX IF NOT EXISTS idx_dog_images_display_order ON dog_images(display_order);
CREATE INDEX IF NOT EXISTS idx_litter_images_litter_id ON litter_images(litter_id);
CREATE INDEX IF NOT EXISTS idx_litter_images_display_order ON litter_images(display_order);

-- Row Level Security
ALTER TABLE dog_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE litter_images ENABLE ROW LEVEL SECURITY;

-- Public can view images
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'dog_images' AND policyname = 'Public can view dog images') THEN
    CREATE POLICY "Public can view dog images" ON dog_images FOR SELECT USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'litter_images' AND policyname = 'Public can view litter images') THEN
    CREATE POLICY "Public can view litter images" ON litter_images FOR SELECT USING (true);
  END IF;
END $$;

-- Admin full access
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'dog_images' AND policyname = 'Admin full access to dog_images') THEN
    CREATE POLICY "Admin full access to dog_images" ON dog_images
      FOR ALL USING (auth.role() = 'authenticated')
      WITH CHECK (auth.role() = 'authenticated');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'litter_images' AND policyname = 'Admin full access to litter_images') THEN
    CREATE POLICY "Admin full access to litter_images" ON litter_images
      FOR ALL USING (auth.role() = 'authenticated')
      WITH CHECK (auth.role() = 'authenticated');
  END IF;
END $$;
