import React from 'react';
import { useState } from 'react';
import useStore from '@store/store';
import { useSupabaseAuth } from '@hooks/useSupabaseAuth';
import { SupabaseService } from '@services/supabase-service';
import { generateDefaultChat } from '@constants/chat';
import { ChatInterface } from '@type/chat';

const useAddChat = () => {
  const { user } = useSupabaseAuth();
  const setChats = useStore((state) => state.setChats);
  const setCurrentChatIndex = useStore((state) => state.setCurrentChatIndex);
  const [isCreatingChat, setIsCreatingChat] = useState(false);

  const addChat = async (folder?: string) => {
    if (isCreatingChat) return; // Prevent multiple simultaneous chat creations
    
    setIsCreatingChat(true);
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
      
      // Update UI immediately for better UX
      setChats(updatedChats);
      setCurrentChatIndex(0);
      
      // Save to Supabase if user is authenticated
      if (user) {
        try {
          await SupabaseService.createChat(user.id, newChat);
          console.log('Chat saved to Supabase successfully');
        } catch (error) {
          console.error('Error creating chat in Supabase:', error);
          // If Supabase save fails, we still keep the local chat
        }
      }
    }
    setIsCreatingChat(false);
  };

  return { addChat, isCreatingChat };
};

export default useAddChat;
    }
  };

  return addChat;
};

export default useAddChat;
