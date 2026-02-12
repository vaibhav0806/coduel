-- Update select_match_questions to support language filtering,
-- language diversity (when "all languages"), and configurable count.
CREATE OR REPLACE FUNCTION select_match_questions(
  p_difficulty INT,
  p_seen_ids UUID[] DEFAULT '{}',
  p_language TEXT DEFAULT NULL,
  p_count INT DEFAULT 3
)
RETURNS TABLE(id UUID) AS $$
BEGIN
  -- Pick p_count questions with diversity across question_type AND language.
  -- When p_language is NULL (all languages): partition by (type, language)
  --   so we get at most 1 pick per (type, language) combo → max diversity.
  -- When p_language is set: partition by type only (language is fixed).
  RETURN QUERY
  WITH candidates AS (
    SELECT q.id, q.question_type, q.language,
           ROW_NUMBER() OVER (
             PARTITION BY q.question_type,
               CASE WHEN p_language IS NULL THEN q.language ELSE 'all' END
             ORDER BY random()
           ) AS rn
    FROM questions q
    WHERE q.difficulty = p_difficulty
      AND q.id != ALL(p_seen_ids)
      AND (p_language IS NULL OR q.language ILIKE p_language)
  ),
  diverse AS (
    SELECT c.id
    FROM candidates c
    WHERE c.rn = 1
    ORDER BY random()
    LIMIT p_count
  )
  SELECT d.id FROM diverse d;

  -- Fallback: if nothing found at this difficulty, pull from any difficulty
  IF NOT FOUND THEN
    RETURN QUERY
    SELECT q.id FROM questions q
    WHERE (p_language IS NULL OR q.language ILIKE p_language)
    ORDER BY random()
    LIMIT p_count;
  END IF;
END;
$$ LANGUAGE plpgsql;
