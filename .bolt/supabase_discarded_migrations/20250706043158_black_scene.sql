/*
  # Create builds table for PC Builder Pro

  1. New Tables
    - `builds`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `name` (text, required, max 100 chars)
      - `description` (text, optional, max 500 chars)
      - `components` (jsonb, stores BuildState object, default empty object)
      - `total_price` (numeric(10,2), calculated total, min 0, default 0.00)
      - `created_at` (timestamp with timezone, default now())
      - `updated_at` (timestamp with timezone, default now())

  2. Security
    - Enable RLS on `builds` table
    - Add policies for authenticated users to manage their own builds

  3. Performance
    - Add indexes for user_id, created_at, and total_price
    - Add trigger to update updated_at timestamp

  4. Constraints
    - Name must be 1-100 characters
    - Description max 500 characters
    - Total price must be >= 0
*/

-- Create the builds table if it doesn't exist
CREATE TABLE IF NOT EXISTS builds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  components jsonb NOT NULL DEFAULT '{}'::jsonb,
  total_price numeric(10,2) NOT NULL DEFAULT 0.00,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add foreign key constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'builds_user_id_fkey' 
    AND table_name = 'builds'
  ) THEN
    ALTER TABLE builds ADD CONSTRAINT builds_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add check constraints if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'builds_name_check'
  ) THEN
    ALTER TABLE builds ADD CONSTRAINT builds_name_check 
    CHECK (length(name) > 0 AND length(name) <= 100);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'builds_description_check'
  ) THEN
    ALTER TABLE builds ADD CONSTRAINT builds_description_check 
    CHECK (length(description) <= 500);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'builds_total_price_check'
  ) THEN
    ALTER TABLE builds ADD CONSTRAINT builds_total_price_check 
    CHECK (total_price >= 0);
  END IF;
END $$;

-- Enable RLS
ALTER TABLE builds ENABLE ROW LEVEL SECURITY;

-- Create or replace policies
DO $$
BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Users can read own builds" ON builds;
  DROP POLICY IF EXISTS "Users can insert own builds" ON builds;
  DROP POLICY IF EXISTS "Users can update own builds" ON builds;
  DROP POLICY IF EXISTS "Users can delete own builds" ON builds;

  -- Create new policies
  CREATE POLICY "Users can read own builds"
    ON builds
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

  CREATE POLICY "Users can insert own builds"
    ON builds
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

  CREATE POLICY "Users can update own builds"
    ON builds
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

  CREATE POLICY "Users can delete own builds"
    ON builds
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS builds_user_id_idx ON builds(user_id);
CREATE INDEX IF NOT EXISTS builds_created_at_idx ON builds(created_at DESC);
CREATE INDEX IF NOT EXISTS builds_total_price_idx ON builds(total_price);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_builds_updated_at ON builds;
CREATE TRIGGER update_builds_updated_at
  BEFORE UPDATE ON builds
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();