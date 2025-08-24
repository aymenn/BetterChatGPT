/*
  # Add Default Chat Settings to User Settings

  1. New Columns
    - `default_chat_config` (jsonb) - Default configuration for new chats
    - `default_system_message` (text) - Default system message for new chats

  2. Updates
    - Add default values for existing users
    - Ensure all users have proper default settings
*/

-- Add new columns for default chat settings
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'chatgpt_user_settings' AND column_name = 'default_chat_config'
  ) THEN
    ALTER TABLE chatgpt_user_settings 
    ADD COLUMN default_chat_config jsonb DEFAULT '{"model": "gpt-3.5-turbo", "max_tokens": 4000, "temperature": 1, "presence_penalty": 0, "top_p": 1, "frequency_penalty": 0}';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'chatgpt_user_settings' AND column_name = 'default_system_message'
  ) THEN
    ALTER TABLE chatgpt_user_settings 
    ADD COLUMN default_system_message text DEFAULT 'You are ChatGPT, a large language model trained by OpenAI.
Carefully heed the user''s instructions.
Respond using Markdown.';
  END IF;
END $$;

-- Update existing rows with default values if they are null
UPDATE chatgpt_user_settings
SET default_chat_config = '{"model": "gpt-3.5-turbo", "max_tokens": 4000, "temperature": 1, "presence_penalty": 0, "top_p": 1, "frequency_penalty": 0}'
WHERE default_chat_config IS NULL;

UPDATE chatgpt_user_settings
SET default_system_message = 'You are ChatGPT, a large language model trained by OpenAI.
Carefully heed the user''s instructions.
Respond using Markdown.'
WHERE default_system_message IS NULL;