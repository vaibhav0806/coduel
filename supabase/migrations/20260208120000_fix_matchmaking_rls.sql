-- Fix match_queue RLS for client-side matchmaking
-- Players need to: see ALL queue entries (find opponents), insert own, delete any (atomic grab)

ALTER TABLE match_queue ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read all queue entries (needed to find opponents)
DO $$ BEGIN
  CREATE POLICY "matchmaking_select_all" ON match_queue
    FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Allow users to insert own queue entry
DO $$ BEGIN
  CREATE POLICY "matchmaking_insert_own" ON match_queue
    FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Allow any authenticated user to delete any queue entry (needed for atomic opponent grab)
DO $$ BEGIN
  CREATE POLICY "matchmaking_delete_any" ON match_queue
    FOR DELETE TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Fix user_question_history: allow inserting for any user_id
-- (needed when one client records history for both players in a match)
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can insert own question history" ON user_question_history;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can insert any question history" ON user_question_history
    FOR INSERT TO authenticated WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Also need upsert support (INSERT ON CONFLICT UPDATE), which requires UPDATE policy
DO $$ BEGIN
  CREATE POLICY "Users can update question history" ON user_question_history
    FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
