-- Migration: Add scientific Q&A table for chatbot
-- This table stores common physics, chemistry, and other science questions with their answers

CREATE TABLE IF NOT EXISTS scientific_qa (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_en text NOT NULL,
  question_ar text NOT NULL,
  answer_en text NOT NULL,
  answer_ar text NOT NULL,
  subject text NOT NULL, -- 'physics', 'chemistry', 'math', 'biology', etc.
  topic text NOT NULL, -- e.g., 'mechanics', 'thermodynamics', 'organic chemistry'
  difficulty text DEFAULT 'medium', -- 'easy', 'medium', 'hard'
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index for faster text search
CREATE INDEX IF NOT EXISTS idx_scientific_qa_subject ON scientific_qa(subject);
CREATE INDEX IF NOT EXISTS idx_scientific_qa_topic ON scientific_qa(topic);
CREATE INDEX IF NOT EXISTS idx_scientific_qa_active ON scientific_qa(is_active) WHERE is_active = true;

-- Enable RLS
ALTER TABLE scientific_qa ENABLE ROW LEVEL SECURITY;

-- Public read, admin write
CREATE POLICY "public read scientific_qa" ON scientific_qa FOR SELECT USING (true);
CREATE POLICY "admin write scientific_qa" ON scientific_qa FOR ALL USING (
  EXISTS (SELECT 1 FROM admins WHERE email = auth.jwt() ->> 'email')
) WITH CHECK (
  EXISTS (SELECT 1 FROM admins WHERE email = auth.jwt() ->> 'email')
);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_scientific_qa_updated_at BEFORE UPDATE ON scientific_qa
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
