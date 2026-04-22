import { useChat } from '../app/providers/ChatProvider';

export const useChatSettings = () => {
    const { settings, updateSettings } = useChat();

    return {
        settings,
        updateSettings,
    };
};
