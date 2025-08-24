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
const [hasLoadedProfile, setHasLoadedProfile] = useState(false);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setIsAuthenticated(!!session?.user);
      
      if (session?.user && !hasLoadedProfile) {
        console.log('Loading User Profile:', session, hasLoadedProfile);

        await loadUserProfile(session.user.id).finally(() => setHasLoadedProfile(true));
      }
      
      setLoading(false);
    };

    getInitialSession();


    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {

        console.log('Got Auth changed event:', event, session);

        switch (event) {
            case "INITIAL_SESSION":
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

              break;

            case "SIGNED_IN":
              if (session?.user?.id !== user?.id) {
                if (session?.user) {
                  await loadUserProfile(session.user.id);
                } else {
                  // Clear user data on logout
                  setApiKey('');
                  setApiEndpoint('https://api.openai.com/v1/chat/completions');
                }
                
                setLoading(false);
              }
              break;

            case "SIGNED_OUT":
              setUser(null);
              // Clear user data on logout
              setApiKey('');
              setApiEndpoint('https://api.openai.com/v1/chat/completions');
              break;

            case "TOKEN_REFRESHED":
              //updateApiToken(session?.access_token);
              break;

            case "USER_UPDATED":
              if (session?.user) {
                await loadUserProfile(session.user.id);
              }
              break;

            case "PASSWORD_RECOVERY":
              //navigate("/reset-password");
              break;
          }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      console.log('Fetching profile for user ID:', userId);
      const { data: profile, error } = await SupabaseService.getUserProfile(userId);
      
      // If profile doesn't exist (error or no data), create it for existing users
      if (error || !profile) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          console.log('Creating profile for existing user:', user.id);
          const { data: newProfile, error: createError } = await SupabaseService.createUserProfile(
            userId,
            user.email || '',
            useStore.getState().apiKey,
            useStore.getState().apiEndpoint
          );
          
          if (createError) {
            console.error('Error creating user profile, trying upsert:', createError);
            // Try using upsert as fallback
            const { data: upsertProfile, error: upsertError } = await SupabaseService.updateUserProfile(userId, {
              api_key: useStore.getState().apiKey,
              api_endpoint: useStore.getState().apiEndpoint,
            });
            
            if (upsertError) {
              console.error('Error upserting user profile:', upsertError);
              return;
            }
            
            // Use the upserted profile
            if (upsertProfile?.api_key) setApiKey(upsertProfile.api_key);
            if (upsertProfile?.api_endpoint) setApiEndpoint(upsertProfile.api_endpoint);
          } else {
            // Use the newly created profile
            if (newProfile?.api_key) setApiKey(newProfile.api_key);
            if (newProfile?.api_endpoint) setApiEndpoint(newProfile.api_endpoint);
          }
        }
      } else {
        // Use existing profile
        console.log('Loaded existing profile for user:', userId);
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