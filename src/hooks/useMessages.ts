import { useMemo } from 'react';
import { useChat } from '../app/providers/ChatProvider';

export const useMessages = (chatId?: string) => {
    const { activeChat, getChatById } = useChat();

    return useMemo(() => {
        if (chatId) {
            return getChatById(chatId);
        }
        return activeChat;
    }, [activeChat, chatId, getChatById]);
};
