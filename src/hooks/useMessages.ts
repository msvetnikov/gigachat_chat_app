import { useMemo } from 'react';
import { useChat } from '../app/providers/ChatProvider';

export const useMessages = (chatId?: string) => {
    // Берем актуальный массив chats напрямую из провайдера
    const { activeChat, chats } = useChat();

    return useMemo(() => {
        if (chatId) {
            // Ищем чат в "живом" массиве, а не через Ref
            return chats.find((chat) => chat.id === chatId) ?? null;
        }
        return activeChat;
    }, [activeChat, chatId, chats]);
};