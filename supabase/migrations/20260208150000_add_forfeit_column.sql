ALTER TABLE matches ADD COLUMN IF NOT EXISTS forfeited_by TEXT REFERENCES auth.users(id);
