import { useEffect, useRef } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { SupabaseService } from '@services/supabase-service';
import useStore from '@store/store';
import { ChatInterface, FolderCollection } from '@type/chat';
import { useSupabaseAuth } from './useSupabaseAuth';

export const useSupabaseSync = () => {
  const { user, isAuthenticated } = useSupabaseAuth();
  const channelRef = useRef<RealtimeChannel | null>(null);
  const settingsChannelRef = useRef<RealtimeChannel | null>(null);
  const [loadingUserData, setLoadingUserData] = useState(false);
  
  const setChats = useStore((state) => state.setChats);
  const setFolders = useStore((state) => state.setFolders);
  const setCurrentChatIndex = useStore((state) => state.setCurrentChatIndex);
  
  // Settings
  const setTheme = useStore((state) => state.setTheme);
  const setAutoTitle = useStore((state) => state.setAutoTitle);
  const setAdvancedMode = useStore((state) => state.setAdvancedMode);
  const setHideMenuOptions = useStore((state) => state.setHideMenuOptions);
  const setHideSideMenu = useStore((state) => state.setHideSideMenu);
  const setEnterToSubmit = useStore((state) => state.setEnterToSubmit);
  const setInlineLatex = useStore((state) => state.setInlineLatex);
  const setMarkdownMode = useStore((state) => state.setMarkdownMode);
  const setCountTotalTokens = useStore((state) => state.setCountTotalTokens);
  const setTotalTokenUsed = useStore((state) => state.setTotalTokenUsed);
  const setPrompts = useStore((state) => state.setPrompts);

  // Load initial data from Supabase
  const loadUserData = async () => {
    if (!user) return;

    setLoadingUserData(true);
    try {
      // Load folders
      const { data: foldersData } = await SupabaseService.getFolders(user.id);
      if (foldersData) {
        const folders: FolderCollection = {};
        foldersData.forEach(folder => {
          folders[folder.id] = {
            id: folder.id,
            name: folder.name,
            color: folder.color || undefined,
            expanded: folder.expanded,
            order: folder.folder_order,
          };
        });
        setFolders(folders);
      }

      // Load chats with messages
      const { data: chatsData } = await SupabaseService.getChats(user.id);
      if (chatsData) {
        const chats: ChatInterface[] = chatsData.map(chat => ({
          id: chat.id,
          title: chat.title,
          folder: chat.folder_id || undefined,
          titleSet: chat.title_set,
          config: chat.config as any,
          messages: ((chat as any).chatgpt_messages || [])
            .sort((a, b) => a.message_order - b.message_order)
            .map(msg => ({
              role: msg.role,
              content: msg.content,
            })),
        }));
        setChats(chats);
        if (chats.length > 0 && useStore.getState().currentChatIndex === -1) {
          setCurrentChatIndex(0);
        }
      }

      // Load user settings
      const { data: settingsData } = await SupabaseService.getUserSettings(user.id);
      if (settingsData) {
        setTheme(settingsData.theme as any);
        setAutoTitle(settingsData.auto_title);
        setAdvancedMode(settingsData.advanced_mode);
        setHideMenuOptions(settingsData.hide_menu_options);
        setHideSideMenu(settingsData.hide_side_menu);
        setEnterToSubmit(settingsData.enter_to_submit);
        setInlineLatex(settingsData.inline_latex);
        setMarkdownMode(settingsData.markdown_mode);
        setCountTotalTokens(settingsData.count_total_tokens);
        setTotalTokenUsed(settingsData.total_token_used as any);
        setPrompts(settingsData.prompts as any);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoadingUserData(false);
    }
  };

  // Migrate localStorage data to Supabase
  const migrateLocalStorageData = async () => {
    if (!user) return;

    try {
      // Check if user already has data in Supabase (only check chats, not profile)
      const { data: existingChats } = await SupabaseService.getChats(user.id);
      if (existingChats && existingChats.length > 0) {
        return; // User already has data, skip migration
      }

      // Get data from localStorage
      const localData = localStorage.getItem('free-chat-gpt');
      if (!localData) return;

      const parsedData = JSON.parse(localData);
      const state = parsedData.state;

      // Migrate folders
      if (state.folders) {
        for (const folder of Object.values(state.folders) as any[]) {
          await SupabaseService.createFolder(user.id, folder);
        }
      }

      // Migrate chats
      if (state.chats) {
        for (const chat of state.chats) {
          await SupabaseService.createChat(user.id, chat);
        }
      }

      // Migrate user settings
      const { error: settingsError } = await SupabaseService.upsertUserSettings(user.id, {
        theme: state.theme,
        auto_title: state.autoTitle,
        advanced_mode: state.advancedMode,
        hide_menu_options: state.hideMenuOptions,
        hide_side_menu: state.hideSideMenu,
        enter_to_submit: state.enterToSubmit,
        inline_latex: state.inlineLatex,
        markdown_mode: state.markdownMode,
        count_total_tokens: state.countTotalTokens,
        total_token_used: state.totalTokenUsed,
        prompts: state.prompts,
      });
      
      if (settingsError) {
        console.error('Error migrating user settings:', settingsError);
      }

      // Clear localStorage after successful migration
      localStorage.removeItem('free-chat-gpt');
      
      console.log('Successfully migrated localStorage data to Supabase');
    } catch (error) {
      console.error('Error migrating localStorage data:', error);
    }
  };

  // Setup real-time subscriptions
  useEffect(() => {
    if (!isAuthenticated || !user) {
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

    // Load initial data and migrate if needed
    const initializeData = async () => {
      await migrateLocalStorageData();
      await loadUserData();
    };
    initializeData();

    // Setup real-time subscription for chats
    channelRef.current = SupabaseService.subscribeToUserChats(user.id, (payload) => {
      console.log('Real-time update:', payload);
      // Reload data when changes occur
      loadUserData();
    });

    // Setup real-time subscription for settings
    settingsChannelRef.current = SupabaseService.subscribeToUserSettings(user.id, (payload) => {
      console.log('Settings update:', payload);
      loadUserData();
    });

    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe();
      }
      if (settingsChannelRef.current) {
        settingsChannelRef.current.unsubscribe();
      }
    };
  }, [isAuthenticated, user]);

  return {
    loadUserData,
    migrateLocalStorageData,
    loadingUserData,
  };
};