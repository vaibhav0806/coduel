-- Add topic column to questions table
ALTER TABLE questions ADD COLUMN IF NOT EXISTS topic TEXT;

-- Create indexes for efficient filtering by topic
CREATE INDEX IF NOT EXISTS idx_questions_topic ON questions(topic);
CREATE INDEX IF NOT EXISTS idx_questions_language_topic ON questions(language, topic);

-- Map existing categories to topics based on their nature:
-- fundamentals: basic syntax, types, variables, booleans, arithmetic, strings (basic)
-- interview: data structures (lists, dicts, sets, tuples), classes, decorators, generators
-- advanced: modern features (walrus, dataclasses, typing), metaclasses, descriptors
-- fun: tricky questions, brain teasers, edge cases (default)

-- Fundamentals: core language basics
UPDATE questions SET topic = 'fundamentals'
WHERE topic IS NULL AND category IN (
  'arithmetic', 'strings', 'types', 'variables', 'booleans',
  'loops', 'functions', 'scope', 'exceptions'
);

-- Interview: data structures and OOP patterns
UPDATE questions SET topic = 'interview'
WHERE topic IS NULL AND category IN (
  'lists', 'dictionaries', 'sets', 'tuples', 'classes',
  'decorators', 'generators', 'iterators', 'comprehensions',
  'mro', 'context'
);

-- Advanced: modern and complex features
UPDATE questions SET topic = 'advanced'
WHERE topic IS NULL AND category IN (
  'walrus', 'dataclasses', 'typing', 'lambda', 'closures',
  'unpacking', 'itertools', 'regex', 'dunder', 'slots',
  'hashing', 'async', 'descriptors', 'metaclasses'
);

-- Fun: everything else (tricky questions, brain teasers)
UPDATE questions SET topic = 'fun' WHERE topic IS NULL;
