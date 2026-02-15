-- 510 Fluffies Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Dogs table
CREATE TABLE dogs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  sex TEXT NOT NULL CHECK (sex IN ('male', 'female')),
  color TEXT NOT NULL,
  birthdate DATE,
  weight TEXT,
  description TEXT,
  pedigree_notes TEXT,
  is_active BOOLEAN DEFAULT true,
  cover_image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dog images table (for gallery)
CREATE TABLE dog_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dog_id UUID REFERENCES dogs(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Health tests table
CREATE TABLE health_tests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dog_id UUID REFERENCES dogs(id) ON DELETE CASCADE,
  test_type TEXT NOT NULL,
  result TEXT NOT NULL,
  test_date DATE,
  document_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Litters table
CREATE TABLE litters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sire_id UUID REFERENCES dogs(id) ON DELETE SET NULL,
  dam_id UUID REFERENCES dogs(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'current', 'available', 'sold')),
  due_date DATE,
  birth_date DATE,
  description TEXT,
  price_range TEXT,
  puppy_count INTEGER,
  available_count INTEGER,
  cover_image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Litter images table
CREATE TABLE litter_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  litter_id UUID REFERENCES litters(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Puppies table - individual puppy tracking within litters
CREATE TABLE puppies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  litter_id UUID REFERENCES litters(id) ON DELETE CASCADE NOT NULL,
  name TEXT,
  collar_color TEXT,
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

-- Applications table
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  city TEXT,
  state TEXT,
  experience_level TEXT CHECK (experience_level IN ('first_time', 'experienced', 'breeder')),
  household_description TEXT,
  living_situation TEXT CHECK (living_situation IN ('house', 'apartment', 'condo', 'other')),
  has_yard BOOLEAN,
  has_other_pets BOOLEAN,
  other_pets_description TEXT,
  has_children BOOLEAN,
  children_ages TEXT,
  goals TEXT,
  timeline TEXT,
  budget_range TEXT,
  preferred_sex TEXT CHECK (preferred_sex IN ('male', 'female', 'either')),
  preferred_color TEXT,
  how_heard_about_us TEXT,
  additional_notes TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'approved', 'declined', 'waitlisted')),
  litter_id UUID REFERENCES litters(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contact messages table
CREATE TABLE contact_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Site settings table
CREATE TABLE site_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pricing options table
CREATE TABLE pricing_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  subtitle TEXT NOT NULL,
  price TEXT NOT NULL,
  price_note TEXT,
  description TEXT,
  icon TEXT DEFAULT 'Heart',
  featured BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  features TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  option_type TEXT DEFAULT 'ownership' CHECK (option_type IN ('ownership', 'service')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_dogs_slug ON dogs(slug);
CREATE INDEX idx_dogs_is_active ON dogs(is_active);
CREATE INDEX idx_litters_status ON litters(status);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_created_at ON applications(created_at DESC);
CREATE INDEX idx_health_tests_dog_id ON health_tests(dog_id);
CREATE INDEX idx_dog_images_dog_id ON dog_images(dog_id);
CREATE INDEX idx_litter_images_litter_id ON litter_images(litter_id);
CREATE INDEX idx_puppies_litter_id ON puppies(litter_id);
CREATE INDEX idx_puppies_status ON puppies(status);
CREATE INDEX idx_puppy_weights_puppy_id ON puppy_weights(puppy_id);
CREATE INDEX idx_puppy_weights_recorded_at ON puppy_weights(recorded_at DESC);
CREATE INDEX idx_puppy_images_puppy_id ON puppy_images(puppy_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
CREATE TRIGGER update_dogs_updated_at
  BEFORE UPDATE ON dogs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_litters_updated_at
  BEFORE UPDATE ON litters
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pricing_options_updated_at
  BEFORE UPDATE ON pricing_options
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_puppies_updated_at
  BEFORE UPDATE ON puppies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security Policies
ALTER TABLE dogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE dog_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE litters ENABLE ROW LEVEL SECURITY;
ALTER TABLE litter_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE puppies ENABLE ROW LEVEL SECURITY;
ALTER TABLE puppy_weights ENABLE ROW LEVEL SECURITY;
ALTER TABLE puppy_images ENABLE ROW LEVEL SECURITY;

-- Public read access for dogs, litters (active only)
CREATE POLICY "Public can view active dogs" ON dogs
  FOR SELECT USING (is_active = true);

CREATE POLICY "Public can view dog images" ON dog_images
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM dogs WHERE dogs.id = dog_images.dog_id AND dogs.is_active = true)
  );

CREATE POLICY "Public can view health tests" ON health_tests
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM dogs WHERE dogs.id = health_tests.dog_id AND dogs.is_active = true)
  );

CREATE POLICY "Public can view litters" ON litters
  FOR SELECT USING (true);

CREATE POLICY "Public can view litter images" ON litter_images
  FOR SELECT USING (true);

CREATE POLICY "Public can view puppies" ON puppies
  FOR SELECT USING (true);

CREATE POLICY "Public can view puppy weights" ON puppy_weights
  FOR SELECT USING (true);

CREATE POLICY "Public can view puppy images" ON puppy_images
  FOR SELECT USING (true);

-- Public can insert applications and contact messages
CREATE POLICY "Public can submit applications" ON applications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can submit contact messages" ON contact_messages
  FOR INSERT WITH CHECK (true);

-- Authenticated users (admin) have full access
CREATE POLICY "Admin full access to dogs" ON dogs
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admin full access to dog_images" ON dog_images
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admin full access to health_tests" ON health_tests
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admin full access to litters" ON litters
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admin full access to litter_images" ON litter_images
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admin full access to applications" ON applications
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admin full access to contact_messages" ON contact_messages
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admin full access to site_settings" ON site_settings
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Public can view active pricing options
CREATE POLICY "Public can view active pricing" ON pricing_options
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admin full access to pricing_options" ON pricing_options
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admin full access to puppies" ON puppies
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admin full access to puppy_weights" ON puppy_weights
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admin full access to puppy_images" ON puppy_images
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Storage buckets (run separately in Supabase dashboard or via API)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('dogs', 'dogs', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('litters', 'litters', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false);

-- Sample data for testing (optional)
INSERT INTO dogs (name, slug, sex, color, birthdate, weight, description, pedigree_notes, is_active, cover_image_url)
VALUES
  ('Baby', 'baby', 'female', 'Cream', '2022-03-15', '22 lbs', 'Baby is our beautiful cream fluffy French Bulldog. She has an amazing temperament and produces stunning puppies.', 'Champion bloodline from European imports', true, '/images/dogs/baby-cover.jpg'),
  ('Dolly', 'dolly', 'female', 'Lilac & Tan', '2021-08-20', '24 lbs', 'Dolly is our lilac and tan beauty. Her color genetics produce some of our most sought-after puppies.', 'Carries blue, cream, and chocolate genes', true, '/images/dogs/dolly-cover.jpg'),
  ('King', 'king', 'male', 'Blue Fawn', '2020-05-10', '28 lbs', 'King is our stunning blue fawn stud. His structure and temperament are exceptional.', 'AKC registered, OFA certified', true, '/images/dogs/king-cover.jpg');

INSERT INTO health_tests (dog_id, test_type, result, test_date)
SELECT id, 'DNA Panel', 'Clear', '2023-01-15' FROM dogs WHERE slug = 'baby'
UNION ALL
SELECT id, 'OFA Hips', 'Good', '2023-02-20' FROM dogs WHERE slug = 'baby'
UNION ALL
SELECT id, 'OFA Patella', 'Normal', '2023-02-20' FROM dogs WHERE slug = 'baby'
UNION ALL
SELECT id, 'Cardiac', 'Clear', '2023-03-10' FROM dogs WHERE slug = 'baby';

INSERT INTO litters (sire_id, dam_id, status, due_date, description, price_range)
SELECT
  (SELECT id FROM dogs WHERE slug = 'king'),
  (SELECT id FROM dogs WHERE slug = 'baby'),
  'planned',
  '2026-04-15',
  'Exciting upcoming litter from King x Baby! Expecting cream, blue, and lilac puppies.',
  '$5,000 - $8,000';

-- Default pricing options
INSERT INTO pricing_options (name, subtitle, price, price_note, description, icon, featured, display_order, features, option_type)
VALUES
  ('Full Ownership', 'Pet Home', '$5,500', 'Starting price', 'Perfect for families seeking a loving companion with no breeding responsibilities.', 'Heart', false, 1, ARRAY['AKC Limited Registration', 'Spay/Neuter Contract Required', 'Health Guarantee (2 years)', 'Microchipped & Vaccinated', 'Lifetime Breeder Support', 'Puppy Starter Kit Included', 'Health Records & Pedigree'], 'ownership'),
  ('Full Ownership', 'With Breeding Rights', '$8,500', 'Starting price', 'For approved breeders seeking to add exceptional genetics to their program.', 'Crown', true, 2, ARRAY['AKC Full Registration', 'Full Breeding Rights', 'Health Guarantee (2 years)', 'Genetic Testing Results', 'Microchipped & Vaccinated', 'Breeding Mentorship Available', 'Show Quality Selection', 'Priority Litter Notifications'], 'ownership'),
  ('Co-Ownership', 'Partnership Program', '$3,500', 'Reduced rate', 'Share the joy and responsibilities of breeding exceptional Fluffy Frenchies.', 'Handshake', false, 3, ARRAY['AKC Full Registration (Shared)', 'Reduced Puppy Price', '1-2 Litter Commitment', 'Breeding Support & Guidance', 'Veterinary Care Guidance', 'Puppy Placement Assistance', 'Full Ownership After Terms', 'Ongoing Mentorship'], 'ownership'),
  ('Stud Service', '', '$2,000 - $3,500', NULL, 'Access to our champion bloodline studs for your breeding program.', 'Star', false, 4, ARRAY[], 'service'),
  ('Deposit Hold', '', '$1,000', NULL, 'Secure your spot on our waitlist for upcoming litters.', 'Shield', false, 5, ARRAY[], 'service'),
  ('Health Testing Package', '', '$500', NULL, 'Comprehensive genetic health panel for breeding dogs.', 'Certificate', false, 6, ARRAY[], 'service');
