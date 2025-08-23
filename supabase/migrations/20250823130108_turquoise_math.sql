```diff
--- a/supabase/migrations/20250823021828_young_voice.sql
+++ b/supabase/migrations/20250823021828_young_voice.sql
@@ -1,7 +1,7 @@
 /*
   # Chat Storage Migration
 
-  1. New Tables
+  1. New Tables (prefixed with chatgpt_)
     - `user_profiles` - Extended user profile information
     - `folders` - Chat organization folders
     - `chats` - Main chat conversations
@@ -13,7 +13,7 @@
 */
 
 -- Extend user profiles
-CREATE TABLE IF NOT EXISTS user_profiles (
+CREATE TABLE IF NOT EXISTS chatgpt_user_profiles (
   id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
   email text,
   api_key text,
@@ -22,7 +22,7 @@
 );
 
 -- Chat folders for organization
-CREATE TABLE IF NOT EXISTS folders (
+CREATE TABLE IF NOT EXISTS chatgpt_folders (
   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
   user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
   name text NOT NULL,
@@ -33,8 +33,8 @@
 );
 
 -- Main chats table
-CREATE TABLE IF NOT EXISTS chats (
+CREATE TABLE IF NOT EXISTS chatgpt_chats (
   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
   user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
-  folder_id uuid REFERENCES folders(id) ON DELETE SET NULL,
+  folder_id uuid REFERENCES chatgpt_folders(id) ON DELETE SET NULL,
   title text NOT NULL,
   title_set boolean DEFAULT false,
   config jsonb NOT NULL DEFAULT '{"model": "gpt-3.5-turbo", "max_tokens": 4000, "temperature": 1, "presence_penalty": 0, "top_p": 1, "frequency_penalty": 0}',
@@ -43,8 +43,8 @@
 );
 
 -- Individual messages
-CREATE TABLE IF NOT EXISTS messages (
+CREATE TABLE IF NOT EXISTS chatgpt_messages (
   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
-  chat_id uuid REFERENCES chats(id) ON DELETE CASCADE NOT NULL,
+  chat_id uuid REFERENCES chatgpt_chats(id) ON DELETE CASCADE NOT NULL,
   role text NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
   content text NOT NULL,
   message_order integer NOT NULL,
@@ -52,7 +52,7 @@
 );
 
 -- User settings and preferences
-CREATE TABLE IF NOT EXISTS user_settings (
+CREATE TABLE IF NOT EXISTS chatgpt_user_settings (
   id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
   theme text DEFAULT 'dark' CHECK (theme IN ('light', 'dark')),
   auto_title boolean DEFAULT false,
@@ -69,56 +69,56 @@
 );
 
 -- Enable Row Level Security
-ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
-ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
-ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
-ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
-ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
+ALTER TABLE chatgpt_user_profiles ENABLE ROW LEVEL SECURITY;
+ALTER TABLE chatgpt_folders ENABLE ROW LEVEL SECURITY;
+ALTER TABLE chatgpt_chats ENABLE ROW LEVEL SECURITY;
+ALTER TABLE chatgpt_messages ENABLE ROW LEVEL SECURITY;
+ALTER TABLE chatgpt_user_settings ENABLE ROW LEVEL SECURITY;
 
 -- RLS Policies for user_profiles
 CREATE POLICY "Users can read own profile"
-  ON user_profiles
+  ON chatgpt_user_profiles
   FOR SELECT
   TO authenticated
   USING (auth.uid() = id);
 
 CREATE POLICY "Users can update own profile"
-  ON user_profiles
+  ON chatgpt_user_profiles
   FOR UPDATE
   TO authenticated
   USING (auth.uid() = id);
 
 CREATE POLICY "Users can insert own profile"
-  ON user_profiles
+  ON chatgpt_user_profiles
   FOR INSERT
   TO authenticated
   WITH CHECK (auth.uid() = id);
 
 -- RLS Policies for folders
 CREATE POLICY "Users can manage own folders"
-  ON folders
+  ON chatgpt_folders
   FOR ALL
   TO authenticated
   USING (auth.uid() = user_id)
   WITH CHECK (auth.uid() = user_id);
 
 -- RLS Policies for chats
 CREATE POLICY "Users can manage own chats"
-  ON chats
+  ON chatgpt_chats
   FOR ALL
   TO authenticated
   USING (auth.uid() = user_id)
   WITH CHECK (auth.uid() = user_id);
 
 -- RLS Policies for messages
 CREATE POLICY "Users can manage own messages"
-  ON messages
+  ON chatgpt_messages
   FOR ALL
   TO authenticated
   USING (
     auth.uid() = (
-      SELECT user_id FROM chats WHERE chats.id = messages.chat_id
+      SELECT user_id FROM chatgpt_chats WHERE chatgpt_chats.id = chatgpt_messages.chat_id
     )
   )
   WITH CHECK (
-    auth.uid() = (
-      SELECT user_id FROM chats WHERE chats.id = messages.chat_id
+    auth.uid() = (
+      SELECT user_id FROM chatgpt_chats WHERE chatgpt_chats.id = chatgpt_messages.chat_id
     )
   );
 
 CREATE POLICY "Users can manage own settings"
-  ON user_settings
+  ON chatgpt_user_settings
   FOR ALL
   TO authenticated
   USING (auth.uid() = id)
   WITH CHECK (auth.uid() = id);
 
 -- Indexes for better performance
-CREATE INDEX IF NOT EXISTS idx_folders_user_id ON folders(user_id);
-CREATE INDEX IF NOT EXISTS idx_folders_order ON folders(user_id, folder_order);
-CREATE INDEX IF NOT EXISTS idx_chats_user_id ON chats(user_id);
-CREATE INDEX IF NOT EXISTS idx_chats_folder_id ON chats(folder_id);
-CREATE INDEX IF NOT EXISTS idx_chats_created_at ON chats(user_id, created_at DESC);
-CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages(chat_id);
-CREATE INDEX IF NOT EXISTS idx_messages_order ON messages(chat_id, message_order);
+CREATE INDEX IF NOT EXISTS idx_chatgpt_folders_user_id ON chatgpt_folders(user_id);
+CREATE INDEX IF NOT EXISTS idx_chatgpt_folders_order ON chatgpt_folders(user_id, folder_order);
+CREATE INDEX IF NOT EXISTS idx_chatgpt_chats_user_id ON chatgpt_chats(user_id);
+CREATE INDEX IF NOT EXISTS idx_chatgpt_chats_folder_id ON chatgpt_chats(folder_id);
+CREATE INDEX IF NOT EXISTS idx_chatgpt_chats_created_at ON chatgpt_chats(user_id, created_at DESC);
+CREATE INDEX IF NOT EXISTS idx_chatgpt_messages_chat_id ON chatgpt_messages(chat_id);
+CREATE INDEX IF NOT EXISTS idx_chatgpt_messages_order ON chatgpt_messages(chat_id, message_order);
 
 -- Function to update updated_at timestamp
 CREATE OR REPLACE FUNCTION update_updated_at_column()
@@ -129,19 +129,19 @@
 $$ language 'plpgsql';
 
 -- Triggers for updated_at
-CREATE TRIGGER update_user_profiles_updated_at
-  BEFORE UPDATE ON user_profiles
+CREATE TRIGGER update_chatgpt_user_profiles_updated_at
+  BEFORE UPDATE ON chatgpt_user_profiles
   FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
 
-CREATE TRIGGER update_folders_updated_at
-  BEFORE UPDATE ON folders
+CREATE TRIGGER update_chatgpt_folders_updated_at
+  BEFORE UPDATE ON chatgpt_folders
   FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
 
-CREATE TRIGGER update_chats_updated_at
-  BEFORE UPDATE ON chats
+CREATE TRIGGER update_chatgpt_chats_updated_at
+  BEFORE UPDATE ON chatgpt_chats
   FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
 
-CREATE TRIGGER update_user_settings_updated_at
-  BEFORE UPDATE ON user_settings
+CREATE TRIGGER update_chatgpt_user_settings_updated_at
+  BEFORE UPDATE ON chatgpt_user_settings
   FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```
```diff
--- a/src/lib/database.types.ts
+++ b/src/lib/database.types.ts
@@ -6,7 +6,7 @@
 export interface Database {
   public: {
     Tables: {
-      user_profiles: {
+      chatgpt_user_profiles: {
         Row: {
           id: string
           email: string | null
@@ -30,7 +30,7 @@
           updated_at?: string
         }
       }
-      folders: {
+      chatgpt_folders: {
         Row: {
           id: string
           user_id: string
@@ -54,7 +54,7 @@
           updated_at?: string
         }
       }
-      chats: {
+      chatgpt_chats: {
         Row: {
           id: string
           user_id: string
@@ -78,7 +78,7 @@
           updated_at?: string
         }
       }
-      messages: {
+      chatgpt_messages: {
         Row: {
           id: string
           chat_id: string
@@ -102,7 +102,7 @@
           created_at?: string
         }
       }
-      user_settings: {
+      chatgpt_user_settings: {
         Row: {
           id: string
           theme: string
```
```diff
--- a/src/services/supabase-service.ts
+++ b/src/services/supabase-service.ts
@@ -10,7 +10,7 @@
   static async signUp(email: string, password: string) {
     const { data, error } = await supabase.auth.signUp({
       email,
       password,
     });
     return { data, error };
   }
@@ -27,7 +27,7 @@
 
   static async createUserProfile(userId: string, email: string, apiKey?: string, apiEndpoint?: string) {
     const { data, error } = await supabase
-      .from('user_profiles')
+      .from('chatgpt_user_profiles')
       .insert({
         id: userId,
         email,
@@ -40,7 +40,7 @@
 
   static async getUserProfile(userId: string) {
     const { data, error } = await supabase
-      .from('user_profiles')
+      .from('chatgpt_user_profiles')
       .select('*')
       .eq('id', userId)
       .single();
@@ -51,7 +51,7 @@
     api_key?: string;
     api_endpoint?: string;
   }) {
-    const { data, error } = await supabase
-      .from('user_profiles')
+    const { data, error } = await supabase
+      .from('chatgpt_user_profiles')
       .update(updates)
       .eq('id', userId)
       .select()
@@ -62,7 +62,7 @@
   // User settings methods
   static async getUserSettings(userId: string) {
     const { data, error } = await supabase
-      .from('user_settings')
+      .from('chatgpt_user_settings')
       .select('*')
       .eq('id', userId)
       .single();
@@ -80,7 +80,7 @@
     prompts?: Prompt[];
   }) {
     const { data, error } = await supabase
-      .from('user_settings')
+      .from('chatgpt_user_settings')
       .upsert({
         id: userId,
         ...settings,
@@ -92,7 +92,7 @@
   // Folder methods
   static async getFolders(userId: string) {
     const { data, error } = await supabase
-      .from('folders')
+      .from('chatgpt_folders')
       .select('*')
       .eq('user_id', userId)
       .order('folder_order', { ascending: true });
@@ -105,7 +105,7 @@
     order: number;
   }) {
     const { data, error } = await supabase
-      .from('folders')
+      .from('chatgpt_folders')
       .insert({
         id: folder.id,
         user_id: userId,
@@ -123,7 +123,7 @@
     expanded?: boolean;
     folder_order?: number;
   }) {
-    const { data, error } = await supabase
-      .from('folders')
+    const { data, error } = await supabase
+      .from('chatgpt_folders')
       .update(updates)
       .eq('id', folderId)
       .select()
@@ -132,7 +132,7 @@
   }
 
   static async deleteFolder(folderId: string) {
-    const { error } = await supabase
-      .from('folders')
+    const { error } = await supabase
+      .from('chatgpt_folders')
       .delete()
       .eq('id', folderId);
     return { error };
@@ -140,7 +140,7 @@
 
   // Chat methods
   static async getChats(userId: string) {
-    const { data, error } = await supabase
-      .from('chats')
+    const { data, error } = await supabase
+      .from('chatgpt_chats')
       .select(`
         *,
         messages (
@@ -155,7 +155,7 @@
 
   static async createChat(userId: string, chat: ChatInterface) {
     const { data: chatData, error: chatError } = await supabase
-      .from('chats')
+      .from('chatgpt_chats')
       .insert({
         id: chat.id,
         user_id: userId,
@@ -174,7 +174,7 @@
       }));
 
       const { error: messagesError } = await supabase
-        .from('messages')
+        .from('chatgpt_messages')
         .insert(messagesData);
 
       if (messagesError) return { data: null, error: messagesError };
@@ -188,7 +188,7 @@
     title_set?: boolean;
     folder_id?: string | null;
     config?: ConfigInterface;
-  }) {
-    const { data, error } = await supabase
-      .from('chats')
+  }) {
+    const { data, error } = await supabase
+      .from('chatgpt_chats')
       .update(updates)
       .eq('id', chatId)
       .select()
@@ -197,7 +197,7 @@
   }
 
   static async deleteChat(chatId: string) {
-    const { error } = await supabase
-      .from('chats')
+    const { error } = await supabase
+      .from('chatgpt_chats')
       .delete()
       .eq('id', chatId);
     return { error };
@@ -206,7 +206,7 @@
   // Message methods
   static async addMessage(chatId: string, message: MessageInterface, order: number) {
     const { data, error } = await supabase
-      .from('messages')
+      .from('chatgpt_messages')
       .insert({
         chat_id: chatId,
         role: message.role,
@@ -220,7 +220,7 @@
     content?: string;
     role?: string;
   }) {
-    const { data, error } = await supabase
-      .from('messages')
+    const { data, error } = await supabase
+      .from('chatgpt_messages')
       .update(updates)
       .eq('id', messageId)
       .select()
@@ -229,7 +229,7 @@
   }
 
   static async deleteMessage(messageId: string) {
-    const { error } = await supabase
-      .from('messages')
+    const { error } = await supabase
+      .from('chatgpt_messages')
       .delete()
       .eq('id', messageId);
     return { error };
@@ -238,7 +238,7 @@
   static async reorderMessages(chatId: string, messages: Array<{ id: string; order: number }>) {
     const updates = messages.map(({ id, order }) => 
       supabase
-        .from('messages')
+        .from('chatgpt_messages')
         .update({ message_order: order })
         .eq('id', id)
     );
@@ -253,7 +253,7 @@
         'postgres_changes',
         {
           event: '*',
           schema: 'public',
-          table: 'chats',
+          table: 'chatgpt_chats',
           filter: `user_id=eq.${userId}`,
         },
         callback
@@ -262,7 +262,7 @@
         'postgres_changes',
         {
           event: '*',
           schema: 'public',
-          table: 'messages',
+          table: 'chatgpt_messages',
         },
         callback
       )
@@ -270,7 +270,7 @@
         'postgres_changes',
         {
           event: '*',
           schema: 'public',
-          table: 'folders',
+          table: 'chatgpt_folders',
           filter: `user_id=eq.${userId}`,
         },
         callback
@@ -283,7 +283,7 @@
         'postgres_changes',
         {
           event: '*',
           schema: 'public',
-          table: 'user_settings',
+          table: 'chatgpt_user_settings',
           filter: `id=eq.${userId}`,
         },
         callback
```