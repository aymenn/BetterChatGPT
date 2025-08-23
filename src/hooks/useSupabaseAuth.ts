import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@lib/supabase';
import { SupabaseService } from '@services/supabase-service';
import useStore from '@store/store';

export const useSupabaseAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const setApiKey = useStore((state) => state.setApiKey);
  const setApiEndpoint = useStore((state) => state.setApiEndpoint);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setIsAuthenticated(!!session?.user);
      
      if (session?.user) {
        await loadUserProfile(session.user.id);
      }
      
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        setIsAuthenticated(!!session?.user);
        
        if (session?.user) {
          await loadUserProfile(session.user.id);
        } else {
          // Clear user data on logout
          setApiKey('');
          setApiEndpoint('https://api.openai.com/v1/chat/completions');
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      const { data: profile } = await SupabaseService.getUserProfile(userId);
      if (profile) {
        if (profile.api_key) setApiKey(profile.api_key);
        if (profile.api_endpoint) setApiEndpoint(profile.api_endpoint);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const signUp = async (email: string, password: string) => {
    setLoading(true);
    const { data, error } = await SupabaseService.signUp(email, password);
    
    if (data.user && !error) {
      // Create user profile
      await SupabaseService.createUserProfile(
        data.user.id,
        email,
        useStore.getState().apiKey,
        useStore.getState().apiEndpoint
      );
    }
    
    setLoading(false);
    return { data, error };
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    const { data, error } = await SupabaseService.signIn(email, password);
    setLoading(false);
    return { data, error };
  };

  const signOut = async () => {
    setLoading(true);
    const { error } = await SupabaseService.signOut();
    setLoading(false);
    return { error };
  };

  return {
    user,
    loading,
    isAuthenticated,
    signUp,
    signIn,
    signOut,
  };
};