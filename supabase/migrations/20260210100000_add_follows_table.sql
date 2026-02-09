CREATE TABLE follows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

CREATE INDEX idx_follows_follower_id ON follows(follower_id);
CREATE INDEX idx_follows_following_id ON follows(following_id);

ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read follows" ON follows FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can follow others" ON follows FOR INSERT TO authenticated WITH CHECK (follower_id = auth.uid());
CREATE POLICY "Users can unfollow" ON follows FOR DELETE TO authenticated USING (follower_id = auth.uid());
