-- Migration: Add pricing_options table
-- Run this in your Supabase SQL Editor to add pricing management

-- Pricing options table
CREATE TABLE IF NOT EXISTS pricing_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- Enable RLS
ALTER TABLE pricing_options ENABLE ROW LEVEL SECURITY;

-- Create or replace the updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create update trigger
CREATE TRIGGER update_pricing_options_updated_at
  BEFORE UPDATE ON pricing_options
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Public can view active pricing options
CREATE POLICY "Public can view active pricing" ON pricing_options
  FOR SELECT USING (is_active = true);

-- Admin full access
CREATE POLICY "Admin full access to pricing_options" ON pricing_options
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Create index for better performance
CREATE INDEX idx_pricing_options_display_order ON pricing_options(display_order);
CREATE INDEX idx_pricing_options_option_type ON pricing_options(option_type);

-- Insert default pricing options
INSERT INTO pricing_options (name, subtitle, price, price_note, description, icon, featured, display_order, features, option_type)
VALUES
  ('Full Ownership', 'Pet Home', '$5,500', 'Starting price', 'Perfect for families seeking a loving companion with no breeding responsibilities.', 'Heart', false, 1, ARRAY['AKC Limited Registration', 'Spay/Neuter Contract Required', 'Health Guarantee (2 years)', 'Microchipped & Vaccinated', 'Lifetime Breeder Support', 'Puppy Starter Kit Included', 'Health Records & Pedigree'], 'ownership'),
  ('Full Ownership', 'With Breeding Rights', '$8,500', 'Starting price', 'For approved breeders seeking to add exceptional genetics to their program.', 'Crown', true, 2, ARRAY['AKC Full Registration', 'Full Breeding Rights', 'Health Guarantee (2 years)', 'Genetic Testing Results', 'Microchipped & Vaccinated', 'Breeding Mentorship Available', 'Show Quality Selection', 'Priority Litter Notifications'], 'ownership'),
  ('Co-Ownership', 'Partnership Program', '$3,500', 'Reduced rate', 'Share the joy and responsibilities of breeding exceptional Fluffy Frenchies.', 'Handshake', false, 3, ARRAY['AKC Full Registration (Shared)', 'Reduced Puppy Price', '1-2 Litter Commitment', 'Breeding Support & Guidance', 'Veterinary Care Guidance', 'Puppy Placement Assistance', 'Full Ownership After Terms', 'Ongoing Mentorship'], 'ownership'),
  ('Stud Service', '', '$2,000 - $3,500', NULL, 'Access to our champion bloodline studs for your breeding program.', 'Star', false, 4, ARRAY[]::TEXT[], 'service'),
  ('Deposit Hold', '', '$1,000', NULL, 'Secure your spot on our waitlist for upcoming litters.', 'Shield', false, 5, ARRAY[]::TEXT[], 'service'),
  ('Health Testing Package', '', '$500', NULL, 'Comprehensive genetic health panel for breeding dogs.', 'Certificate', false, 6, ARRAY[]::TEXT[], 'service');
