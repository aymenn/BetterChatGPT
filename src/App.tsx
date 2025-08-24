import React, { useEffect } from 'react';
import useStore from '@store/store';
import i18n from './i18n';
import { useSupabaseSync } from '@hooks/useSupabaseSync';
import { AuthModal } from '@components/Auth';

import Chat from '@components/Chat';
import Menu from '@components/Menu';

import useInitialiseNewChat from '@hooks/useInitialiseNewChat';
import { ChatInterface } from '@type/chat';
import { Theme } from '@type/theme';
import ApiPopup from '@components/ApiPopup';
import Toast from '@components/Toast';
import SpinnerIcon from '@icon/SpinnerIcon';
import { useAuth } from '@components/Auth/AuthProvider';

function App() {
  const { user, loading, isAuthenticated } = useAuth();
  const { loadingUserData } = useSupabaseSync();
  
  const initialiseNewChat = useInitialiseNewChat();
  const setChats = useStore((state) => state.setChats);
  const setTheme = useStore((state) => state.setTheme);
  const setApiKey = useStore((state) => state.setApiKey);
  const setCurrentChatIndex = useStore((state) => state.setCurrentChatIndex);
  
  const [showAuthModal, setShowAuthModal] = React.useState(false);

  useEffect(() => {
    document.documentElement.lang = i18n.language;
    i18n.on('languageChanged', (lng) => {
      document.documentElement.lang = lng;
    });
  }, []);

  useEffect(() => {
    // Show auth modal if not authenticated and not loading
    console.log('In App.useEffect:', { loading, isAuthenticated, loadingUserData });
    if (!loading && !isAuthenticated) {
      setShowAuthModal(true);
    } else {
      setShowAuthModal(false);
    }
  }, [loading, isAuthenticated, loadingUserData]);

  useEffect(() => {
    // legacy local storage
    const oldChats = localStorage.getItem('chats');
    const apiKey = localStorage.getItem('apiKey');
    const theme = localStorage.getItem('theme');

    if (apiKey) {
      // legacy local storage
      setApiKey(apiKey);
      localStorage.removeItem('apiKey');
    }

    if (theme) {
      // legacy local storage
      setTheme(theme as Theme);
      localStorage.removeItem('theme');
    }

    if (oldChats) {
      // legacy local storage
      try {
        const chats: ChatInterface[] = JSON.parse(oldChats);
        if (chats.length > 0) {
          setChats(chats);
          setCurrentChatIndex(0);
        } else {
          initialiseNewChat();
        }
      } catch (e: unknown) {
        console.log(e);
        initialiseNewChat();
      }
      localStorage.removeItem('chats');
    } else {
      // existing local storage
      const chats = useStore.getState().chats;
      const currentChatIndex = useStore.getState().currentChatIndex;
      if (!chats || chats.length === 0) {
        initialiseNewChat();
      }
      if (
        chats &&
        !(currentChatIndex >= 0 && currentChatIndex < chats.length)
      ) {
        setCurrentChatIndex(0);
      }
    }
  }, []);

  // Show loading spinner while checking authentication or loading user data
  console.log('Are we loading? ', { loading, loadingUserData, isAuthenticated });
  if (loading || (isAuthenticated && loadingUserData)) {
    return (
      <div className='flex items-center justify-center h-screen bg-gray-900'>
        <div className='flex flex-col items-center gap-4'>
          <SpinnerIcon className='w-8 h-8 animate-spin text-white' />
          <p className='text-white text-sm'>
            {loading ? 'Authenticating...' : 'Loading your data...'}
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className='overflow-hidden w-full h-full relative'>
      <Menu />
      <Chat />
      <ApiPopup />
      <Toast />
      <AuthModal isOpen={showAuthModal} setIsOpen={setShowAuthModal} />
    </div>
  );
}

export default App;
