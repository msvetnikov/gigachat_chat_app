import { useChat } from '../app/providers/ChatProvider';

export const useStreaming = () => {
    const { isLoading, stopGeneration } = useChat();

    return {
        isLoading,
        stopGeneration,
    };
};
