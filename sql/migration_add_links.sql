-- 3loomangy: Migration — Add optional direct links + dashboard boxes
-- Run this in Supabase SQL Editor

-- Add optional direct link to semesters (boxes)
ALTER TABLE semesters ADD COLUMN IF NOT EXISTS link text;

-- Add optional direct link to courses
ALTER TABLE courses ADD COLUMN IF NOT EXISTS link text;

-- Dashboard boxes: custom cards on the Materials page (alongside years)
-- Each box can have a direct link OR drill down to sub-links
CREATE TABLE IF NOT EXISTS dashboard_boxes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  title_ar text,
  description text,
  link text,             -- optional direct URL; if null → opens detail page
  "order" int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- RLS for dashboard_boxes
ALTER TABLE dashboard_boxes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read" ON dashboard_boxes FOR SELECT USING (true);
CREATE POLICY "admin write" ON dashboard_boxes FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Allow resource_links to reference dashboard_boxes
-- We need to add 'dashboard_box' to the parent_kind enum
ALTER TYPE parent_kind ADD VALUE IF NOT EXISTS 'dashboard_box';
