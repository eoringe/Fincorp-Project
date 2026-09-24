-- ============================================
-- Live Collaborative Idea Board — Database Setup
-- Run this in the Supabase SQL Editor
-- ============================================

-- 1. Create the ideas table
CREATE TABLE IF NOT EXISTS ideas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  text TEXT NOT NULL CHECK (char_length(text) <= 200),
  upvotes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Enable Row Level Security (permissive — no auth required)
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access"
  ON ideas FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert access"
  ON ideas FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update access"
  ON ideas FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- 3. Enable Realtime on the ideas table
ALTER PUBLICATION supabase_realtime ADD TABLE ideas;

-- 4. Create an atomic upvote function (avoids race conditions)
CREATE OR REPLACE FUNCTION increment_upvotes(idea_id UUID)
RETURNS void
LANGUAGE sql
AS $$
  UPDATE ideas
  SET upvotes = upvotes + 1
  WHERE id = idea_id;
$$;
