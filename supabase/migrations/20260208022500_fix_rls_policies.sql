-- Add INSERT/UPDATE policies for league_memberships so client can write directly
CREATE POLICY "Users can insert own league memberships"
  ON league_memberships FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own league memberships"
  ON league_memberships FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Enable RLS on user_question_history and add policies
ALTER TABLE user_question_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own question history"
  ON user_question_history FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own question history"
  ON user_question_history FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());
