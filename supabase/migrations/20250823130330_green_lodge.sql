/*
  # Prefix tables with chatgpt_

  1. Table Renaming
    - Rename all application tables to use chatgpt_ prefix
    - Update all foreign key references
    - Update RLS policies and indexes

  2. Security
    - Maintain all existing RLS policies with new table names
    - Update policy references to use prefixed tables

  3. Performance
    - Recreate all indexes with new table names
    - Update triggers for new table names
*/

-- Rename tables to add chatgpt_ prefix
ALTER TABLE IF EXISTS user_profiles RENAME TO chatgpt_user_profiles;
ALTER TABLE IF EXISTS folders RENAME TO chatgpt_folders;
ALTER TABLE IF EXISTS chats RENAME TO chatgpt_chats;
ALTER TABLE IF EXISTS messages RENAME TO chatgpt_messages;
ALTER TABLE IF EXISTS user_settings RENAME TO chatgpt_user_settings;

-- Update foreign key constraints
DO $$
BEGIN
  -- Update folder_id reference in chats table
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'chatgpt_chats' AND constraint_type = 'FOREIGN KEY'
  ) THEN
    ALTER TABLE chatgpt_chats DROP CONSTRAINT IF EXISTS chats_folder_id_fkey;
    ALTER TABLE chatgpt_chats ADD CONSTRAINT chatgpt_chats_folder_id_fkey 
      FOREIGN KEY (folder_id) REFERENCES chatgpt_folders(id) ON DELETE SET NULL;
  END IF;

  -- Update chat_id reference in messages table
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'chatgpt_messages' AND constraint_type = 'FOREIGN KEY'
  ) THEN
    ALTER TABLE chatgpt_messages DROP CONSTRAINT IF EXISTS messages_chat_id_fkey;
    ALTER TABLE chatgpt_messages ADD CONSTRAINT chatgpt_messages_chat_id_fkey 
      FOREIGN KEY (chat_id) REFERENCES chatgpt_chats(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Drop old policies if they exist
DROP POLICY IF EXISTS "Users can read own profile" ON chatgpt_user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON chatgpt_user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON chatgpt_user_profiles;
DROP POLICY IF EXISTS "Users can manage own folders" ON chatgpt_folders;
DROP POLICY IF EXISTS "Users can manage own chats" ON chatgpt_chats;
DROP POLICY IF EXISTS "Users can manage own messages" ON chatgpt_messages;
DROP POLICY IF EXISTS "Users can manage own settings" ON chatgpt_user_settings;

-- Recreate RLS policies with correct table references
CREATE POLICY "Users can read own profile"
  ON chatgpt_user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON chatgpt_user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON chatgpt_user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can manage own folders"
  ON chatgpt_folders
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own chats"
  ON chatgpt_chats
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own messages"
  ON chatgpt_messages
  FOR ALL
  TO authenticated
  USING (
    auth.uid() = (
      SELECT user_id FROM chatgpt_chats WHERE chatgpt_chats.id = chatgpt_messages.chat_id
    )
  )
  WITH CHECK (
    auth.uid() = (
      SELECT user_id FROM chatgpt_chats WHERE chatgpt_chats.id = chatgpt_messages.chat_id
    )
  );

CREATE POLICY "Users can manage own settings"
  ON chatgpt_user_settings
  FOR ALL
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Drop old indexes if they exist
DROP INDEX IF EXISTS idx_folders_user_id;
DROP INDEX IF EXISTS idx_folders_order;
DROP INDEX IF EXISTS idx_chats_user_id;
DROP INDEX IF EXISTS idx_chats_folder_id;
DROP INDEX IF EXISTS idx_chats_created_at;
DROP INDEX IF EXISTS idx_messages_chat_id;
DROP INDEX IF EXISTS idx_messages_order;

-- Recreate indexes with new table names
CREATE INDEX IF NOT EXISTS idx_chatgpt_folders_user_id ON chatgpt_folders(user_id);
CREATE INDEX IF NOT EXISTS idx_chatgpt_folders_order ON chatgpt_folders(user_id, folder_order);
CREATE INDEX IF NOT EXISTS idx_chatgpt_chats_user_id ON chatgpt_chats(user_id);
CREATE INDEX IF NOT EXISTS idx_chatgpt_chats_folder_id ON chatgpt_chats(folder_id);
CREATE INDEX IF NOT EXISTS idx_chatgpt_chats_created_at ON chatgpt_chats(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chatgpt_messages_chat_id ON chatgpt_messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_chatgpt_messages_order ON chatgpt_messages(chat_id, message_order);

-- Drop old triggers if they exist
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON chatgpt_user_profiles;
DROP TRIGGER IF EXISTS update_folders_updated_at ON chatgpt_folders;
DROP TRIGGER IF EXISTS update_chats_updated_at ON chatgpt_chats;
DROP TRIGGER IF EXISTS update_user_settings_updated_at ON chatgpt_user_settings;

-- Recreate triggers with new table names
CREATE TRIGGER update_chatgpt_user_profiles_updated_at
  BEFORE UPDATE ON chatgpt_user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chatgpt_folders_updated_at
  BEFORE UPDATE ON chatgpt_folders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chatgpt_chats_updated_at
  BEFORE UPDATE ON chatgpt_chats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chatgpt_user_settings_updated_at
  BEFORE UPDATE ON chatgpt_user_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();