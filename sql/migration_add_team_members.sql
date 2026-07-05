-- 3loomangy: Migration — Add team_committees table for "Meet the Team" page
-- Run this in Supabase SQL Editor

-- Team committees table
CREATE TABLE IF NOT EXISTS team_committees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  name_ar text,
  description text,
  description_ar text,
  responsibilities text,
  responsibilities_ar text,
  head_name text,
  contact_link text,
  icon text,
  is_active boolean DEFAULT true,
  "order" int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- RLS for team_committees
ALTER TABLE team_committees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read" ON team_committees FOR SELECT USING (is_active = true);
CREATE POLICY "admin write" ON team_committees FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Add intro fields to site_config
ALTER TABLE site_config ADD COLUMN IF NOT EXISTS team_intro_title text;
ALTER TABLE site_config ADD COLUMN IF NOT EXISTS team_intro_title_ar text;
ALTER TABLE site_config ADD COLUMN IF NOT EXISTS team_intro_body text;
ALTER TABLE site_config ADD COLUMN IF NOT EXISTS team_intro_body_ar text;
