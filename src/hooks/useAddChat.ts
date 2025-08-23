import React from 'react';
import useStore from '@store/store';
import { useSupabaseAuth } from '@hooks/useSupabaseAuth';
import { useSupabaseStore } from '@store/supabase-store';
import { generateDefaultChat } from '@constants/chat';
import { ChatInterface } from '@type/chat';

const useAddChat = () => {
  const { user } = useSupabaseAuth();
  const { createChat } = useSupabaseStore();
  const setChats = useStore((state) => state.setChats);
  const setCurrentChatIndex = useStore((state) => state.setCurrentChatIndex);

  const addChat = async (folder?: string) => {
    const chats = useStore.getState().chats;
    if (chats) {
      const updatedChats: ChatInterface[] = JSON.parse(JSON.stringify(chats));
      let titleIndex = 1;
      let title = `New Chat ${titleIndex}`;

      while (chats.some((chat) => chat.title === title)) {
        titleIndex += 1;
        title = `New Chat ${titleIndex}`;
      }

      updatedChats.unshift(generateDefaultChat(title, folder));
      
      // Save to Supabase if user is authenticated
      if (user) {
        await createChat(user.id, updatedChats[0]);
      }
      
      setChats(updatedChats);
      setCurrentChatIndex(0);
    }
  };

  return addChat;
};

export default useAddChat;
