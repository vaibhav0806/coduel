-- The original migration (20260208150000_add_forfeit_column) was marked as applied
-- via `supabase migration repair` without actually running the SQL.
-- This migration ensures the column exists.
ALTER TABLE matches ADD COLUMN IF NOT EXISTS forfeited_by UUID REFERENCES auth.users(id);
