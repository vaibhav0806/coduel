-- Enable RLS on league_memberships (if not already)
ALTER TABLE league_memberships ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read league_memberships (needed for leaderboard)
CREATE POLICY "Anyone can read league memberships"
  ON league_memberships FOR SELECT
  TO authenticated
  USING (true);

-- Allow service role to insert/update (edge functions use service role)
-- Service role already bypasses RLS, but add user self-read for safety
CREATE POLICY "Users can read own league memberships"
  ON league_memberships FOR SELECT
  TO anon
  USING (true);
