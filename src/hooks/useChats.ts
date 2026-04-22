import { useChat } from '../app/providers/ChatProvider';

export const useChats = () => {
    const { chats, activeChatId, createChat, deleteChat, renameChat, selectChat } = useChat();

    return {
        chats,
        activeChatId,
        createChat,
        deleteChat,
        renameChat,
        selectChat,
    };
};
