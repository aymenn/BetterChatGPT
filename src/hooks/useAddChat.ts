import React from 'react';
import useStore from '@store/store';
import { useSupabaseAuth } from '@hooks/useSupabaseAuth';
import { SupabaseService } from '@services/supabase-service';
import { generateDefaultChat } from '@constants/chat';
import { ChatInterface } from '@type/chat';

const useAddChat = () => {
  const { user } = useSupabaseAuth();
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

      const newChat = generateDefaultChat(title, folder);
      updatedChats.unshift(newChat);
      
      // Save to Supabase if user is authenticated
      if (user) {
        try {
          await SupabaseService.createChat(user.id, newChat);
        } catch (error) {
          console.error('Error creating chat in Supabase:', error);
        }
      }
      
      setChats(updatedChats);
      setCurrentChatIndex(0);
    }
  };

  return addChat;
};

export default useAddChat;
