-- Create testimonials table
CREATE TABLE testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  customer_location TEXT,
  customer_image_url TEXT,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  puppy_id UUID REFERENCES puppies(id) ON DELETE SET NULL,
  is_published BOOLEAN DEFAULT false,
  featured BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create index for published testimonials
CREATE INDEX idx_testimonials_published ON testimonials(is_published, display_order);

-- Create index for featured testimonials
CREATE INDEX idx_testimonials_featured ON testimonials(featured, is_published);

-- Enable RLS
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- Allow public read access to published testimonials
CREATE POLICY "Public can view published testimonials"
  ON testimonials FOR SELECT
  USING (is_published = true);

-- Allow authenticated users to manage testimonials
CREATE POLICY "Authenticated users can manage testimonials"
  ON testimonials FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
