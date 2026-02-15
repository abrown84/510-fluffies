-- Puppies table - individual puppy tracking within litters
CREATE TABLE puppies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  litter_id UUID REFERENCES litters(id) ON DELETE CASCADE NOT NULL,
  name TEXT,
  collar_color TEXT, -- for identification before naming
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female')),
  color TEXT,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'deposit', 'sold')),
  price DECIMAL(10,2),
  birth_weight_oz DECIMAL(5,2),
  current_weight_oz DECIMAL(5,2),
  buyer_name TEXT,
  buyer_email TEXT,
  buyer_phone TEXT,
  deposit_amount DECIMAL(10,2),
  deposit_paid_at TIMESTAMPTZ,
  sold_at TIMESTAMPTZ,
  notes TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Puppy weight tracking over time
CREATE TABLE puppy_weights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  puppy_id UUID REFERENCES puppies(id) ON DELETE CASCADE NOT NULL,
  weight_oz DECIMAL(5,2) NOT NULL,
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT
);

-- Puppy images
CREATE TABLE puppy_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  puppy_id UUID REFERENCES puppies(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_puppies_litter_id ON puppies(litter_id);
CREATE INDEX idx_puppies_status ON puppies(status);
CREATE INDEX idx_puppy_weights_puppy_id ON puppy_weights(puppy_id);
CREATE INDEX idx_puppy_weights_recorded_at ON puppy_weights(recorded_at DESC);
CREATE INDEX idx_puppy_images_puppy_id ON puppy_images(puppy_id);

-- Trigger for updated_at
CREATE TRIGGER update_puppies_updated_at
  BEFORE UPDATE ON puppies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security
ALTER TABLE puppies ENABLE ROW LEVEL SECURITY;
ALTER TABLE puppy_weights ENABLE ROW LEVEL SECURITY;
ALTER TABLE puppy_images ENABLE ROW LEVEL SECURITY;

-- Public can view puppies from active litters
CREATE POLICY "Public can view puppies" ON puppies
  FOR SELECT USING (true);

CREATE POLICY "Public can view puppy weights" ON puppy_weights
  FOR SELECT USING (true);

CREATE POLICY "Public can view puppy images" ON puppy_images
  FOR SELECT USING (true);

-- Admin full access
CREATE POLICY "Admin full access to puppies" ON puppies
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admin full access to puppy_weights" ON puppy_weights
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admin full access to puppy_images" ON puppy_images
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
