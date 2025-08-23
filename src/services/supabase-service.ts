import { supabase } from '@lib/supabase';
import { ChatInterface, FolderCollection, MessageInterface, ConfigInterface } from '@type/chat';
import { Prompt } from '@type/prompt';
import { Theme } from '@type/theme';
import { TotalTokenUsed } from '@type/chat';

export class SupabaseService {
  // Auth methods
  static async signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { data, error };
  }

  static async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  }

  static async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  }

  static async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  }

  // Profile methods
  static async createUserProfile(userId: string, email: string, apiKey?: string, apiEndpoint?: string) {
    const { data, error } = await supabase
      .from('chatgpt_user_profiles')
      .insert({
        id: userId,
        email,
        api_key: apiKey,
        api_endpoint: apiEndpoint,
      })
      .select()
      .single();
    return { data, error };
  }

  static async getUserProfile(userId: string) {
    const { data, error } = await supabase
      .from('chatgpt_user_profiles')
      .select('*')
      .eq('id', userId)
      .single();
    return { data, error };
  }

  static async updateUserProfile(userId: string, updates: {
    api_key?: string;
    api_endpoint?: string;
  }) {
    // Use upsert to handle cases where profile doesn't exist yet
    const { data, error } = await supabase
      .from('chatgpt_user_profiles')
      .upsert({
        id: userId,
        ...updates,
      })
      .select()
      .single();
    return { data, error };
  }

  // User settings methods
  static async getUserSettings(userId: string) {
    const { data, error } = await supabase
      .from('chatgpt_user_settings')
      .select('*')
      .eq('id', userId)
      .single();
    return { data, error };
  }

  static async upsertUserSettings(userId: string, settings: {
    theme?: Theme;
    auto_title?: boolean;
    advanced_mode?: boolean;
    hide_menu_options?: boolean;
    hide_side_menu?: boolean;
    enter_to_submit?: boolean;
    inline_latex?: boolean;
    markdown_mode?: boolean;
    count_total_tokens?: boolean;
    total_token_used?: TotalTokenUsed;
    prompts?: Prompt[];
  }) {
    const { data, error } = await supabase
      .from('chatgpt_user_settings')
      .upsert({
        id: userId,
        ...settings,
      })
      .select()
      .single();
    return { data, error };
  }

  // Folder methods
  static async getFolders(userId: string) {
    const { data, error } = await supabase
      .from('chatgpt_folders')
      .select('*')
      .eq('user_id', userId)
      .order('folder_order', { ascending: true });
    return { data, error };
  }

  static async createFolder(userId: string, folder: {
    id: string;
    name: string;
    color?: string;
    expanded?: boolean;
    order: number;
  }) {
    const { data, error } = await supabase
      .from('chatgpt_folders')
      .insert({
        id: folder.id,
        user_id: userId,
        name: folder.name,
        color: folder.color,
        expanded: folder.expanded,
        folder_order: folder.order,
      })
      .select()
      .single();
    return { data, error };
  }

  static async updateFolder(folderId: string, updates: {
    name?: string;
    color?: string;
    expanded?: boolean;
    folder_order?: number;
  }) {
    const { data, error } = await supabase
      .from('chatgpt_folders')
      .update(updates)
      .eq('id', folderId)
      .select()
      .single();
    return { data, error };
  }

  static async deleteFolder(folderId: string) {
    const { error } = await supabase
      .from('chatgpt_folders')
      .delete()
      .eq('id', folderId);
    return { error };
  }

  // Chat methods
  static async getChats(userId: string) {
    const { data, error } = await supabase
      .from('chatgpt_chats')
      .select(`
        *,
        messages (
          id,
          role,
          content,
          message_order,
          created_at
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    return { data, error };
  }

  static async createChat(userId: string, chat: ChatInterface) {
    const { data: chatData, error: chatError } = await supabase
      .from('chatgpt_chats')
      .insert({
        id: chat.id,
        user_id: userId,
        folder_id: chat.folder,
        title: chat.title,
        title_set: chat.titleSet,
        config: chat.config,
      })
      .select()
      .single();

    if (chatError) return { data: null, error: chatError };

    // Insert messages
    if (chat.messages.length > 0) {
      const messagesData = chat.messages.map((message, index) => ({
        chat_id: chat.id,
        role: message.role,
        content: message.content,
        message_order: index,
      }));

      const { error: messagesError } = await supabase
        .from('chatgpt_messages')
        .insert(messagesData);

      if (messagesError) return { data: null, error: messagesError };
    }

    return { data: chatData, error: null };
  }

  static async updateChat(chatId: string, updates: {
    title?: string;
    title_set?: boolean;
    folder_id?: string | null;
    config?: ConfigInterface;
  }) {
    const { data, error } = await supabase
      .from('chatgpt_chats')
      .update(updates)
      .eq('id', chatId)
      .select()
      .single();
    return { data, error };
  }

  static async deleteChat(chatId: string) {
    const { error } = await supabase
      .from('chatgpt_chats')
      .delete()
      .eq('id', chatId);
    return { error };
  }

  // Message methods
  static async addMessage(chatId: string, message: MessageInterface, order: number) {
    const { data, error } = await supabase
      .from('chatgpt_messages')
      .insert({
        chat_id: chatId,
        role: message.role,
        content: message.content,
        message_order: order,
      })
      .select()
      .single();
    return { data, error };
  }

  static async updateMessage(messageId: string, updates: {
    content?: string;
    role?: string;
  }) {
    const { data, error } = await supabase
      .from('chatgpt_messages')
      .update(updates)
      .eq('id', messageId)
      .select()
      .single();
    return { data, error };
  }

  static async deleteMessage(messageId: string) {
    const { error } = await supabase
      .from('chatgpt_messages')
      .delete()
      .eq('id', messageId);
    return { error };
  }

  static async reorderMessages(chatId: string, messages: Array<{ id: string; order: number }>) {
    const updates = messages.map(({ id, order }) => 
      supabase
        .from('chatgpt_messages')
        .update({ message_order: order })
        .eq('id', id)
    );
    
    const results = await Promise.all(updates);
    const errors = results.filter(result => result.error).map(result => result.error);
    return { errors: errors.length > 0 ? errors : null };
  }

  // Real-time subscriptions
  static subscribeToUserChats(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel('user-chats')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chatgpt_chats',
          filter: `user_id=eq.${userId}`,
        },
        callback
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chatgpt_messages',
        },
        callback
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chatgpt_folders',
          filter: `user_id=eq.${userId}`,
        },
        callback
      )
      .subscribe();
  }

  static subscribeToUserSettings(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel('user-settings')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chatgpt_user_settings',
          filter: `id=eq.${userId}`,
        },
        callback
      )
      .subscribe();
  }
}