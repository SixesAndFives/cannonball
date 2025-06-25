-- Enable RLS
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to read comments
CREATE POLICY "Allow anonymous users to read comments"
ON comments FOR SELECT
USING (true);

-- Allow anonymous users to create comments
CREATE POLICY "Allow anonymous users to create comments"
ON comments FOR INSERT
WITH CHECK (true);

-- Allow users to delete their own comments
CREATE POLICY "Allow users to delete their own comments"
ON comments FOR DELETE
USING (auth.uid() = user_id);
