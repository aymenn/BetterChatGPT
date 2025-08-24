import { StoreSlice } from './store';
import { Theme } from '@type/theme';
import { ConfigInterface, TotalTokenUsed } from '@type/chat';
import { _defaultChatConfig, _defaultSystemMessage } from '@constants/chat';
import { SupabaseService } from '@services/supabase-service';

export interface ConfigSlice {
  openConfig: boolean;
  theme: Theme;
  autoTitle: boolean;
  hideMenuOptions: boolean;
  advancedMode: boolean;
  defaultChatConfig: ConfigInterface;
  defaultSystemMessage: string;
  hideSideMenu: boolean;
  enterToSubmit: boolean;
  inlineLatex: boolean;
  markdownMode: boolean;
  countTotalTokens: boolean;
  totalTokenUsed: TotalTokenUsed;
  setOpenConfig: (openConfig: boolean) => void;
  setTheme: (theme: Theme) => void;
  setAutoTitle: (autoTitle: boolean) => void;
  setAdvancedMode: (advancedMode: boolean) => void;
  setDefaultChatConfig: (defaultChatConfig: ConfigInterface) => void;
  setDefaultSystemMessage: (defaultSystemMessage: string) => void;
  setHideMenuOptions: (hideMenuOptions: boolean) => void;
  setHideSideMenu: (hideSideMenu: boolean) => void;
  setEnterToSubmit: (enterToSubmit: boolean) => void;
  setInlineLatex: (inlineLatex: boolean) => void;
  setMarkdownMode: (markdownMode: boolean) => void;
  setCountTotalTokens: (countTotalTokens: boolean) => void;
  setTotalTokenUsed: (totalTokenUsed: TotalTokenUsed) => void;
}

export const createConfigSlice: StoreSlice<ConfigSlice> = (set, get) => ({
  openConfig: false,
  theme: 'dark',
  hideMenuOptions: false,
  hideSideMenu: false,
  autoTitle: false,
  enterToSubmit: true,
  advancedMode: true,
  defaultChatConfig: _defaultChatConfig,
  defaultSystemMessage: _defaultSystemMessage,
  inlineLatex: false,
  markdownMode: true,
  countTotalTokens: false,
  totalTokenUsed: {},
  setOpenConfig: (openConfig: boolean) => {
    set((prev: ConfigSlice) => ({
      ...prev,
      openConfig: openConfig,
    }));
  },
  setTheme: (theme: Theme) => {
    set((prev: ConfigSlice) => ({
      ...prev,
      theme: theme,
    }));
    
    // Update in Supabase if user is authenticated
    const updateSettings = async () => {
      try {
        const { user } = await SupabaseService.getCurrentUser();
        if (user) {
          await SupabaseService.upsertUserSettings(user.id, { theme });
        }
      } catch (error) {
        console.error('Error updating theme in Supabase:', error);
      }
    };
    updateSettings();
  },
  setAutoTitle: (autoTitle: boolean) => {
    set((prev: ConfigSlice) => ({
      ...prev,
      autoTitle: autoTitle,
    }));
    
    // Update in Supabase if user is authenticated
    const updateSettings = async () => {
      try {
        const { user } = await SupabaseService.getCurrentUser();
        if (user) {
          await SupabaseService.upsertUserSettings(user.id, { auto_title: autoTitle });
        }
      } catch (error) {
        console.error('Error updating auto title in Supabase:', error);
      }
    };
    updateSettings();
  },
  setAdvancedMode: (advancedMode: boolean) => {
    set((prev: ConfigSlice) => ({
      ...prev,
      advancedMode: advancedMode,
    }));
    
    // Update in Supabase if user is authenticated
    const updateSettings = async () => {
      try {
        const { user } = await SupabaseService.getCurrentUser();
        if (user) {
          await SupabaseService.upsertUserSettings(user.id, { advanced_mode: advancedMode });
        }
      } catch (error) {
        console.error('Error updating advanced mode in Supabase:', error);
      }
    };
    updateSettings();
  },
  setDefaultChatConfig: (defaultChatConfig: ConfigInterface) => {
    set((prev: ConfigSlice) => ({
      ...prev,
      defaultChatConfig: defaultChatConfig,
    }));
    
    // Update in Supabase if user is authenticated
    const updateSettings = async () => {
      try {
        const { user } = await SupabaseService.getCurrentUser();
        if (user) {
          await SupabaseService.upsertUserSettings(user.id, { default_chat_config: defaultChatConfig });
        }
      } catch (error) {
        console.error('Error updating default chat config in Supabase:', error);
      }
    };
    updateSettings();
  },
  setDefaultSystemMessage: (defaultSystemMessage: string) => {
    set((prev: ConfigSlice) => ({
      ...prev,
      defaultSystemMessage: defaultSystemMessage,
    }));
    
    // Update in Supabase if user is authenticated
    const updateSettings = async () => {
      try {
        const { user } = await SupabaseService.getCurrentUser();
        if (user) {
          await SupabaseService.upsertUserSettings(user.id, { default_system_message: defaultSystemMessage });
        }
      } catch (error) {
        console.error('Error updating default system message in Supabase:', error);
      }
    };
    updateSettings();
  },
  setHideMenuOptions: (hideMenuOptions: boolean) => {
    set((prev: ConfigSlice) => ({
      ...prev,
      hideMenuOptions: hideMenuOptions,
    }));
    
    // Update in Supabase if user is authenticated
    const updateSettings = async () => {
      try {
        const { user } = await SupabaseService.getCurrentUser();
        if (user) {
          await SupabaseService.upsertUserSettings(user.id, { hide_menu_options: hideMenuOptions });
        }
      } catch (error) {
        console.error('Error updating hide menu options in Supabase:', error);
      }
    };
    updateSettings();
  },
  setHideSideMenu: (hideSideMenu: boolean) => {
    set((prev: ConfigSlice) => ({
      ...prev,
      hideSideMenu: hideSideMenu,
    }));
    
    // Update in Supabase if user is authenticated
    const updateSettings = async () => {
      try {
        const { user } = await SupabaseService.getCurrentUser();
        if (user) {
          await SupabaseService.upsertUserSettings(user.id, { hide_side_menu: hideSideMenu });
        }
      } catch (error) {
        console.error('Error updating hide side menu in Supabase:', error);
      }
    };
    updateSettings();
  },
  setEnterToSubmit: (enterToSubmit: boolean) => {
    set((prev: ConfigSlice) => ({
      ...prev,
      enterToSubmit: enterToSubmit,
    }));
    
    // Update in Supabase if user is authenticated
    const updateSettings = async () => {
      try {
        const { user } = await SupabaseService.getCurrentUser();
        if (user) {
          await SupabaseService.upsertUserSettings(user.id, { enter_to_submit: enterToSubmit });
        }
      } catch (error) {
        console.error('Error updating enter to submit in Supabase:', error);
      }
    };
    updateSettings();
  },
  setInlineLatex: (inlineLatex: boolean) => {
    set((prev: ConfigSlice) => ({
      ...prev,
      inlineLatex: inlineLatex,
    }));
    
    // Update in Supabase if user is authenticated
    const updateSettings = async () => {
      try {
        const { user } = await SupabaseService.getCurrentUser();
        if (user) {
          await SupabaseService.upsertUserSettings(user.id, { inline_latex: inlineLatex });
        }
      } catch (error) {
        console.error('Error updating inline latex in Supabase:', error);
      }
    };
    updateSettings();
  },
  setMarkdownMode: (markdownMode: boolean) => {
    set((prev: ConfigSlice) => ({
      ...prev,
      markdownMode: markdownMode,
    }));
    
    // Update in Supabase if user is authenticated
    const updateSettings = async () => {
      try {
        const { user } = await SupabaseService.getCurrentUser();
        if (user) {
          await SupabaseService.upsertUserSettings(user.id, { markdown_mode: markdownMode });
        }
      } catch (error) {
        console.error('Error updating markdown mode in Supabase:', error);
      }
    };
    updateSettings();
  },
  setCountTotalTokens: (countTotalTokens: boolean) => {
    set((prev: ConfigSlice) => ({
      ...prev,
      countTotalTokens: countTotalTokens,
    }));
    
    // Update in Supabase if user is authenticated
    const updateSettings = async () => {
      try {
        const { user } = await SupabaseService.getCurrentUser();
        if (user) {
          await SupabaseService.upsertUserSettings(user.id, { count_total_tokens: countTotalTokens });
        }
      } catch (error) {
        console.error('Error updating count total tokens in Supabase:', error);
      }
    };
    updateSettings();
  },
  setTotalTokenUsed: (totalTokenUsed: TotalTokenUsed) => {
    set((prev: ConfigSlice) => ({
      ...prev,
      totalTokenUsed: totalTokenUsed,
    }));
    
    // Update in Supabase if user is authenticated
    const updateSettings = async () => {
      try {
        const { user } = await SupabaseService.getCurrentUser();
        if (user) {
          await SupabaseService.upsertUserSettings(user.id, { total_token_used: totalTokenUsed });
        }
      } catch (error) {
        console.error('Error updating total token used in Supabase:', error);
      }
    };
    updateSettings();
  },
});
