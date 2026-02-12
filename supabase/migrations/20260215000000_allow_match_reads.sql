-- Ensure matches, match_rounds, and questions are readable by all authenticated users.
-- This is needed so users can view match reviews for matches they weren't part of
-- (e.g. viewing another player's match history from their profile).

-- matches: all authenticated users can read any match
DO $$ BEGIN
  CREATE POLICY "Anyone can read matches"
    ON matches FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- match_rounds: all authenticated users can read any round
DO $$ BEGIN
  CREATE POLICY "Anyone can read match rounds"
    ON match_rounds FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- questions: all authenticated users can read any question
DO $$ BEGIN
  CREATE POLICY "Anyone can read questions"
    ON questions FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
