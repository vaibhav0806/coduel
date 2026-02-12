-- Add question_type column (existing questions default to 'mcq')
ALTER TABLE questions ADD COLUMN question_type TEXT NOT NULL DEFAULT 'mcq';

-- Drop any CHECK constraints on correct_answer before type conversion
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT con.conname
    FROM pg_constraint con
    JOIN pg_attribute att ON att.attnum = ANY(con.conkey) AND att.attrelid = con.conrelid
    WHERE con.conrelid = 'public.questions'::regclass
      AND att.attname = 'correct_answer'
      AND con.contype = 'c'
  LOOP
    EXECUTE format('ALTER TABLE questions DROP CONSTRAINT %I', r.conname);
  END LOOP;
END $$;

-- Drop any CHECK constraints on player answers before type conversion
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT con.conname, att.attname
    FROM pg_constraint con
    JOIN pg_attribute att ON att.attnum = ANY(con.conkey) AND att.attrelid = con.conrelid
    WHERE con.conrelid = 'public.match_rounds'::regclass
      AND att.attname IN ('player1_answer', 'player2_answer')
      AND con.contype = 'c'
  LOOP
    EXECUTE format('ALTER TABLE match_rounds DROP CONSTRAINT %I', r.conname);
  END LOOP;
END $$;

-- Convert correct_answer from INTEGER to JSONB
-- MCQ: 2, Multi-select: [0,2], Reorder: [1,2,3,0], Fill-blank: [1,3]
ALTER TABLE questions
  ALTER COLUMN correct_answer TYPE JSONB USING to_jsonb(correct_answer);

-- Convert player answers from INTEGER to JSONB
ALTER TABLE match_rounds
  ALTER COLUMN player1_answer TYPE JSONB USING to_jsonb(player1_answer);
ALTER TABLE match_rounds
  ALTER COLUMN player2_answer TYPE JSONB USING to_jsonb(player2_answer);
