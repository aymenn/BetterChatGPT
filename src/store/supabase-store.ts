import { create } from 'zustand';
import { SupabaseService } from '@services/supabase-service';
import { ChatInterface, FolderCollection, MessageInterface } from '@type/chat';

interface SupabaseStoreState {
  // Sync status
  isSyncing: boolean;
  lastSyncTime: Date | null;
  syncError: string | null;
  
  // Actions
  setSyncing: (syncing: boolean) => void;
  setSyncError: (error: string | null) => void;
  setLastSyncTime: (time: Date) => void;
  
  // Chat operations
  createChat: (userId: string, chat: ChatInterface) => Promise<void>;
  updateChat: (chatId: string, updates: any) => Promise<void>;
  deleteChat: (chatId: string) => Promise<void>;
  
  // Message operations
  addMessage: (chatId: string, message: MessageInterface, order: number) => Promise<void>;
  updateMessage: (messageId: string, updates: any) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  
  // Folder operations
  createFolder: (userId: string, folder: any) => Promise<void>;
  updateFolder: (folderId: string, updates: any) => Promise<void>;
  deleteFolder: (folderId: string) => Promise<void>;
  
  // Settings operations
  updateUserSettings: (userId: string, settings: any) => Promise<void>;
}

export const useSupabaseStore = create<SupabaseStoreState>((set, get) => ({
  isSyncing: false,
  lastSyncTime: null,
  syncError: null,
  
  setSyncing: (syncing) => set({ isSyncing: syncing }),
  setSyncError: (error) => set({ syncError: error }),
  setLastSyncTime: (time) => set({ lastSyncTime: time }),
  
  createChat: async (userId, chat) => {
    set({ isSyncing: true, syncError: null });
    try {
      await SupabaseService.createChat(userId, chat);
      set({ lastSyncTime: new Date() });
    } catch (error) {
      set({ syncError: (error as Error).message });
    } finally {
      set({ isSyncing: false });
    }
  },
  
  updateChat: async (chatId, updates) => {
    set({ isSyncing: true, syncError: null });
    try {
      await SupabaseService.updateChat(chatId, updates);
      set({ lastSyncTime: new Date() });
    } catch (error) {
      set({ syncError: (error as Error).message });
    } finally {
      set({ isSyncing: false });
    }
  },
  
  deleteChat: async (chatId) => {
    set({ isSyncing: true, syncError: null });
    try {
      await SupabaseService.deleteChat(chatId);
      set({ lastSyncTime: new Date() });
    } catch (error) {
      set({ syncError: (error as Error).message });
    } finally {
      set({ isSyncing: false });
    }
  },
  
  addMessage: async (chatId, message, order) => {
    set({ isSyncing: true, syncError: null });
    try {
      await SupabaseService.addMessage(chatId, message, order);
      set({ lastSyncTime: new Date() });
    } catch (error) {
      set({ syncError: (error as Error).message });
    } finally {
      set({ isSyncing: false });
    }
  },
  
  updateMessage: async (messageId, updates) => {
    set({ isSyncing: true, syncError: null });
    try {
      await SupabaseService.updateMessage(messageId, updates);
      set({ lastSyncTime: new Date() });
    } catch (error) {
      set({ syncError: (error as Error).message });
    } finally {
      set({ isSyncing: false });
    }
  },
  
  deleteMessage: async (messageId) => {
    set({ isSyncing: true, syncError: null });
    try {
      await SupabaseService.deleteMessage(messageId);
      set({ lastSyncTime: new Date() });
    } catch (error) {
      set({ syncError: (error as Error).message });
    } finally {
      set({ isSyncing: false });
    }
  },
  
  createFolder: async (userId, folder) => {
    set({ isSyncing: true, syncError: null });
    try {
      await SupabaseService.createFolder(userId, folder);
      set({ lastSyncTime: new Date() });
    } catch (error) {
      set({ syncError: (error as Error).message });
    } finally {
      set({ isSyncing: false });
    }
  },
  
  updateFolder: async (folderId, updates) => {
    set({ isSyncing: true, syncError: null });
    try {
      await SupabaseService.updateFolder(folderId, updates);
      set({ lastSyncTime: new Date() });
    } catch (error) {
      set({ syncError: (error as Error).message });
    } finally {
      set({ isSyncing: false });
    }
  },
  
  deleteFolder: async (folderId) => {
    set({ isSyncing: true, syncError: null });
    try {
      await SupabaseService.deleteFolder(folderId);
      set({ lastSyncTime: new Date() });
    } catch (error) {
      set({ syncError: (error as Error).message });
    } finally {
      set({ isSyncing: false });
    }
  },
  
  updateUserSettings: async (userId, settings) => {
    set({ isSyncing: true, syncError: null });
    try {
      await SupabaseService.upsertUserSettings(userId, settings);
      set({ lastSyncTime: new Date() });
    } catch (error) {
      set({ syncError: (error as Error).message });
    } finally {
      set({ isSyncing: false });
    }
  },
}));