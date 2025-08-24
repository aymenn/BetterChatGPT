import { StoreSlice } from './store';
import { Prompt } from '@type/prompt';
import defaultPrompts from '@constants/prompt';
import { SupabaseService } from '@services/supabase-service';

export interface PromptSlice {
  prompts: Prompt[];
  setPrompts: (commandPrompt: Prompt[]) => void;
}

export const createPromptSlice: StoreSlice<PromptSlice> = (set, get) => ({
  prompts: defaultPrompts,
  setPrompts: (prompts: Prompt[]) => {
    set((prev: PromptSlice) => ({
      ...prev,
      prompts: prompts,
    }));
    
    // Update in Supabase if user is authenticated
    const updateSettings = async () => {
      try {
        const { user } = await SupabaseService.getCurrentUser();
        if (user) {
          await SupabaseService.upsertUserSettings(user.id, { prompts });
        }
      } catch (error) {
        console.error('Error updating prompts in Supabase:', error);
      }
    };
    updateSettings();
  },
});
