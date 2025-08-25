import { useEffect, useRef, useState } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { SupabaseService } from '@services/supabase-service';
import useStore from '@store/store';
import { ChatInterface, FolderCollection } from '@type/chat';
import { useAuth } from '@components/Auth/AuthProvider';


export const useSupabaseSync = () => {
  const { userRef, isAuthenticated } = useAuth();
  const channelRef = useRef<RealtimeChannel | null>(null);
  const settingsChannelRef = useRef<RealtimeChannel | null>(null);
  const [loadingUserData, setLoadingUserData] = useState(false);
  
  const setChats = useStore((state) => state.setChats);
  const setFolders = useStore((state) => state.setFolders);
  const setCurrentChatIndex = useStore((state) => state.setCurrentChatIndex);
  
  // Load initial data from Supabase
  const loadUserData = async () => {
    console.log('Loading user data from Supabase...', userRef.current);
    if (!userRef.current) return;

    setLoadingUserData(true);
    try {
      // Load folders
      const { data: foldersData } = await SupabaseService.getFolders(userRef.current.id);
      if (foldersData) {
        const folders: FolderCollection = {};
        foldersData.forEach(folder => {
          folders[folder.id] = {
            id: folder.id,
            name: folder.name,
            color: folder.color || undefined,
            expanded: folder.expanded ?? true,
            order: folder.folder_order ?? 0,
          };
        });
        setFolders(folders);
      }

      console.log('Folders loaded');
      // Load chats with messages
      const { data: chatsData } = await SupabaseService.getChats(userRef.current.id);
      if (chatsData) {
        interface ChatGPTMessage {
          role: string;
          content: string;
          message_order: number;
        }

        interface ChatData {
          id: string;
          title: string;
          folder_id?: string | null;
          title_set?: boolean | null;
          config: unknown;
          chatgpt_messages?: ChatGPTMessage[];
        }

        interface Message {
          role: string;
          content: string;
        }

        const chats: ChatInterface[] = (chatsData as ChatData[]).map((chat: ChatData) => ({
          id: chat.id,
          title: chat.title,
          folder: chat.folder_id || undefined,
          titleSet: chat.title_set ?? false,
          config: chat.config as any,
          messages: ((chat.chatgpt_messages || []) as ChatGPTMessage[])
            .sort((a: ChatGPTMessage, b: ChatGPTMessage) => a.message_order - b.message_order)
            .map((msg: ChatGPTMessage, idx: number) => ({
              id: `${chat.id}-msg-${idx}`,
              role: msg.role as import('@type/chat').Role,
              content: msg.content,
            })),
        }));
        setChats(chats);
        if (chats.length > 0 && useStore.getState().currentChatIndex === -1) {
          setCurrentChatIndex(0);
        }
      }
      console.log('Chats loaded');
      // Load user settings
      const { data: settingsData } = await SupabaseService.getUserSettings(userRef.current.id);
      if (settingsData) {
        useStore.getState().hydrateSettings({
          theme: settingsData.theme as any,
          autoTitle: settingsData.auto_title ?? false,
          advancedMode: settingsData.advanced_mode ?? false,
          hideMenuOptions: settingsData.hide_menu_options ?? false,
          hideSideMenu: settingsData.hide_side_menu ?? false,
          enterToSubmit: settingsData.enter_to_submit ?? true,
          inlineLatex: settingsData.inline_latex ?? false,
          markdownMode: settingsData.markdown_mode ?? true,
          countTotalTokens: settingsData.count_total_tokens ?? true,
          totalTokenUsed: settingsData.total_token_used as any,
          defaultChatConfig: settingsData.default_chat_config as any,
          defaultSystemMessage: settingsData.default_system_message ?? '',
        });
      }
      console.log('Settings loaded');
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      console.log('Finished loading user data');
      setLoadingUserData(false);
    }
  };

  // Setup real-time subscriptions
  useEffect(() => {
    if (!isAuthenticated || !userRef.current) {
      // Cleanup subscriptions when not authenticated
      if (channelRef.current) {
        channelRef.current.unsubscribe();
        channelRef.current = null;
      }
      if (settingsChannelRef.current) {
        settingsChannelRef.current.unsubscribe();
        settingsChannelRef.current = null;
      }
      return;
    }

    // Load initial data
    const initializeData = async () => {
      await loadUserData();
    };
    initializeData();

    // Setup real-time subscription for chats
    channelRef.current = SupabaseService.subscribeToUserChats(userRef.current.id, async (payload) => {
      console.log('Real-time update:', payload);
      // Reload data when changes occur
      await loadUserData();
    });

    // Setup real-time subscription for settings
    settingsChannelRef.current = SupabaseService.subscribeToUserSettings(userRef.current.id, async (payload) => {
      console.log('Settings update:', payload);
      await loadUserData();
    });

    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe();
      }
      if (settingsChannelRef.current) {
        settingsChannelRef.current.unsubscribe();
      }
    };
  }, [isAuthenticated, userRef.current]);

  return {
    loadUserData,
    loadingUserData,
  };
};