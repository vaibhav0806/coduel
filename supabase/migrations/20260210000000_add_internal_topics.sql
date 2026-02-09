-- Add internal_topic column for backend question categorization
-- This is separate from the existing 'topic' column used by the Topics tab

ALTER TABLE questions ADD COLUMN IF NOT EXISTS internal_topic TEXT;

-- Create index for efficient filtering
CREATE INDEX IF NOT EXISTS idx_questions_internal_topic ON questions(internal_topic);
CREATE INDEX IF NOT EXISTS idx_questions_language_internal_topic ON questions(language, internal_topic);

-- Map existing questions based on category

-- basics: core language fundamentals
UPDATE questions SET internal_topic = 'basics'
WHERE internal_topic IS NULL AND category IN ('arithmetic', 'types', 'variables', 'booleans');

-- strings: string manipulation
UPDATE questions SET internal_topic = 'strings'
WHERE internal_topic IS NULL AND category IN ('strings');

-- control-flow: loops and iteration patterns
UPDATE questions SET internal_topic = 'control-flow'
WHERE internal_topic IS NULL AND category IN ('loops', 'comprehensions');

-- functions: function definitions, scope, closures
UPDATE questions SET internal_topic = 'functions'
WHERE internal_topic IS NULL AND category IN ('functions', 'lambda', 'scope', 'closures');

-- collections: data structures
UPDATE questions SET internal_topic = 'collections'
WHERE internal_topic IS NULL AND category IN ('lists', 'dictionaries', 'sets', 'tuples');

-- oop: object-oriented programming
UPDATE questions SET internal_topic = 'oop'
WHERE internal_topic IS NULL AND category IN ('classes', 'mro', 'dunder', 'slots');

-- errors: exception handling
UPDATE questions SET internal_topic = 'errors'
WHERE internal_topic IS NULL AND category IN ('exceptions');

-- iterators: generators and iterators
UPDATE questions SET internal_topic = 'iterators'
WHERE internal_topic IS NULL AND category IN ('generators', 'iterators', 'itertools');

-- decorators: decorators and context managers
UPDATE questions SET internal_topic = 'decorators'
WHERE internal_topic IS NULL AND category IN ('decorators', 'context');

-- modern: modern python features
UPDATE questions SET internal_topic = 'modern'
WHERE internal_topic IS NULL AND category IN ('walrus', 'unpacking', 'typing', 'dataclasses', 'async', 'hashing', 'metaclasses', 'descriptors');

-- Fallback: assign any remaining questions to 'basics'
UPDATE questions SET internal_topic = 'basics' WHERE internal_topic IS NULL;
