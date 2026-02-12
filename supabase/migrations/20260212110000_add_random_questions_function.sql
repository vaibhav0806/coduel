-- Function to select 3 random questions with type diversity
-- Picks from 3 different question_types when possible, excludes seen questions
CREATE OR REPLACE FUNCTION select_match_questions(
  p_difficulty INT,
  p_seen_ids UUID[] DEFAULT '{}'
)
RETURNS TABLE(id UUID) AS $$
BEGIN
  -- Pick 3 questions from distinct types, randomized within each type
  -- Uses a window function to rank random picks per type, then takes top 3 distinct types
  RETURN QUERY
  WITH candidates AS (
    SELECT q.id, q.question_type,
           ROW_NUMBER() OVER (PARTITION BY q.question_type ORDER BY random()) AS rn
    FROM questions q
    WHERE q.difficulty = p_difficulty
      AND q.id != ALL(p_seen_ids)
  ),
  diverse AS (
    SELECT c.id, c.question_type
    FROM candidates c
    WHERE c.rn = 1
    ORDER BY random()
    LIMIT 3
  )
  SELECT d.id FROM diverse d;

  -- If we got fewer than 3 (e.g. not enough unseen), fill from any difficulty
  IF NOT FOUND THEN
    RETURN QUERY
    SELECT q.id FROM questions q ORDER BY random() LIMIT 3;
  END IF;
END;
$$ LANGUAGE plpgsql;
