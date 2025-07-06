/*
  # Create builds table for PC Builder Pro

  1. New Tables
    - `builds`
      - `id` (uuid, primary key)
      - `created_at` (timestamp)
      - `user_id` (uuid, foreign key to auth.users)
      - `name` (text, required)
      - `description` (text, optional)
      - `components` (jsonb, stores BuildState object)
      - `total_price` (numeric, calculated total)

  2. Security
    - Enable RLS on `builds` table
    - Add policies for authenticated users to manage their own builds
*/

CREATE TABLE IF NOT EXISTS builds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  components jsonb NOT NULL,
  total_price numeric NOT NULL DEFAULT 0
);

ALTER TABLE builds ENABLE ROW LEVEL SECURITY;

-- Policy for users to read their own builds
CREATE POLICY "Users can read own builds"
  ON builds
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy for users to insert their own builds
CREATE POLICY "Users can insert own builds"
  ON builds
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy for users to update their own builds
CREATE POLICY "Users can update own builds"
  ON builds
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy for users to delete their own builds
CREATE POLICY "Users can delete own builds"
  ON builds
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS builds_user_id_idx ON builds(user_id);
CREATE INDEX IF NOT EXISTS builds_created_at_idx ON builds(created_at DESC);