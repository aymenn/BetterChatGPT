import { defaultAPIEndpoint } from '@constants/auth';
import { SupabaseService } from '@services/supabase-service';
import { useSupabaseAuth } from '@hooks/useSupabaseAuth';
import { StoreSlice } from './store';

export interface AuthSlice {
  apiKey?: string;
  apiEndpoint: string;
  firstVisit: boolean;
  setApiKey: (apiKey: string) => void;
  setApiEndpoint: (apiEndpoint: string) => void;
  setFirstVisit: (firstVisit: boolean) => void;
}

export const createAuthSlice: StoreSlice<AuthSlice> = (set, get) => ({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || undefined,
  apiEndpoint: defaultAPIEndpoint,
  firstVisit: true,
  setApiKey: (apiKey: string) => {
    set((prev: AuthSlice) => ({
      ...prev,
      apiKey: apiKey,
    }));
    
    // Update in Supabase if user is authenticated
    const updateProfile = async () => {
      try {
        const { user } = await SupabaseService.getCurrentUser();
        if (user) {
          await SupabaseService.updateUserProfile(user.id, { api_key: apiKey });
        }
      } catch (error) {
        console.error('Error updating API key in Supabase:', error);
      }
    };
    updateProfile();
  },
  setApiEndpoint: (apiEndpoint: string) => {
    set((prev: AuthSlice) => ({
      ...prev,
      apiEndpoint: apiEndpoint,
    }));
    
    // Update in Supabase if user is authenticated
    const updateProfile = async () => {
      try {
        const { user } = await SupabaseService.getCurrentUser();
        if (user) {
          await SupabaseService.updateUserProfile(user.id, { api_endpoint: apiEndpoint });
        }
      } catch (error) {
        console.error('Error updating API endpoint in Supabase:', error);
      }
    };
    updateProfile();
  },
  setFirstVisit: (firstVisit: boolean) => {
    set((prev: AuthSlice) => ({
      ...prev,
      firstVisit: firstVisit,
    }));
  },
});
