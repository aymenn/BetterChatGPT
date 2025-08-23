/*
  # Chat Storage Migration

  1. New Tables
    - `user_profiles` - Extended user profile information
    - `folders` - Chat organization folders
    - `chats` - Main chat conversations
    - `messages` - Individual chat messages
    - `user_settings` - User preferences and API keys

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access only their own data

  3. Real-time
    - Enable real-time subscriptions for live sync across devices
*/

-- Extend user profiles
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email text,
  api_key text,
  api_endpoint text DEFAULT 'https://api.openai.com/v1/chat/completions',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Chat folders for organization
CREATE TABLE IF NOT EXISTS folders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  color text,
  expanded boolean DEFAULT false,
  folder_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Main chats table
CREATE TABLE IF NOT EXISTS chats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  folder_id uuid REFERENCES folders(id) ON DELETE SET NULL,
  title text NOT NULL,
  title_set boolean DEFAULT false,
  config jsonb NOT NULL DEFAULT '{"model": "gpt-3.5-turbo", "max_tokens": 4000, "temperature": 1, "presence_penalty": 0, "top_p": 1, "frequency_penalty": 0}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Individual messages
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id uuid REFERENCES chats(id) ON DELETE CASCADE NOT NULL,
  role text NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content text NOT NULL,
  message_order integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- User settings and preferences
CREATE TABLE IF NOT EXISTS user_settings (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  theme text DEFAULT 'dark' CHECK (theme IN ('light', 'dark')),
  auto_title boolean DEFAULT false,
  advanced_mode boolean DEFAULT true,
  hide_menu_options boolean DEFAULT false,
  hide_side_menu boolean DEFAULT false,
  enter_to_submit boolean DEFAULT true,
  inline_latex boolean DEFAULT false,
  markdown_mode boolean DEFAULT true,
  count_total_tokens boolean DEFAULT false,
  total_token_used jsonb DEFAULT '{}',
  prompts jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- RLS Policies for folders
CREATE POLICY "Users can manage own folders"
  ON folders
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for chats
CREATE POLICY "Users can manage own chats"
  ON chats
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for messages
CREATE POLICY "Users can manage own messages"
  ON messages
  FOR ALL
  TO authenticated
  USING (
    auth.uid() = (
      SELECT user_id FROM chats WHERE chats.id = messages.chat_id
    )
  )
  WITH CHECK (
    auth.uid() = (
      SELECT user_id FROM chats WHERE chats.id = messages.chat_id
    )
  );

-- RLS Policies for user_settings
CREATE POLICY "Users can manage own settings"
  ON user_settings
  FOR ALL
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_folders_user_id ON folders(user_id);
CREATE INDEX IF NOT EXISTS idx_folders_order ON folders(user_id, folder_order);
CREATE INDEX IF NOT EXISTS idx_chats_user_id ON chats(user_id);
CREATE INDEX IF NOT EXISTS idx_chats_folder_id ON chats(folder_id);
CREATE INDEX IF NOT EXISTS idx_chats_created_at ON chats(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_messages_order ON messages(chat_id, message_order);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_folders_updated_at
  BEFORE UPDATE ON folders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chats_updated_at
  BEFORE UPDATE ON chats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();