/*
  # Fix User Profile Update Issues

  1. Security Updates
    - Drop and recreate RLS policies for chatgpt_user_profiles
    - Ensure proper UPSERT permissions for user profiles
    - Add missing INSERT policy for profile creation

  2. Table Updates
    - Ensure chatgpt_user_profiles table exists with correct structure
    - Add proper constraints and defaults
*/

-- Ensure the table exists with correct structure
CREATE TABLE IF NOT EXISTS chatgpt_user_profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email text,
  api_key text,
  api_endpoint text DEFAULT 'https://api.openai.com/v1/chat/completions',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE chatgpt_user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Users can read own profile" ON chatgpt_user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON chatgpt_user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON chatgpt_user_profiles;
DROP POLICY IF EXISTS "Users can upsert own profile" ON chatgpt_user_profiles;

-- Create comprehensive RLS policies
CREATE POLICY "Users can read own profile"
  ON chatgpt_user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON chatgpt_user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON chatgpt_user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Add trigger for updated_at if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_chatgpt_user_profiles_updated_at ON chatgpt_user_profiles;
CREATE TRIGGER update_chatgpt_user_profiles_updated_at
  BEFORE UPDATE ON chatgpt_user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();