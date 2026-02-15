-- Migration: Add site_settings table
-- Stores site configuration as key-value pairs

-- Site settings table
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Create update trigger
CREATE TRIGGER update_site_settings_updated_at
  BEFORE UPDATE ON site_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Public can view site settings
CREATE POLICY "Public can view site settings" ON site_settings
  FOR SELECT USING (true);

-- Admin full access
CREATE POLICY "Admin full access to site_settings" ON site_settings
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Insert default settings
INSERT INTO site_settings (key, value)
VALUES
  ('site_info', '{
    "name": "510 Fluffies",
    "tagline": "Premium Fluffy French Bulldogs",
    "description": "Bay Area''s premier breeder of exceptional Fluffy French Bulldogs. We focus on health, temperament, and quality bloodlines to produce exceptional companions.",
    "email": "hello@510fluffies.com",
    "phone": "",
    "location": "Bay Area, California"
  }'::jsonb),
  ('social_links', '{
    "instagram": "@510.fluffies",
    "facebook": "",
    "tiktok": "",
    "youtube": ""
  }'::jsonb),
  ('business_hours', '{
    "timezone": "America/Los_Angeles",
    "note": "By appointment only",
    "hours": []
  }'::jsonb),
  ('seo', '{
    "meta_title": "510 Fluffies | Premium Fluffy French Bulldogs",
    "meta_description": "Bay Area''s premier breeder of exceptional Fluffy French Bulldogs. Health tested, champion bloodlines, lifetime support.",
    "og_image": ""
  }'::jsonb),
  ('notifications', '{
    "email_new_applications": true,
    "email_new_messages": true,
    "notification_email": "hello@510fluffies.com"
  }'::jsonb),
  ('waitlist', '{
    "enabled": true,
    "deposit_amount": 1000,
    "message": "Join our waitlist to be notified when new litters become available."
  }'::jsonb)
ON CONFLICT (key) DO NOTHING;
