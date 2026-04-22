import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useReducer,
    useRef,
    useState,
    type ReactNode,
} from 'react';
import { createChatCompletion, streamChatCompletion } from '../../api/gigachat';
import { loadChatState, saveChatState } from '../../utils/storage';
import type {
    Chat,
    ChatAction,
    ChatState,
    Message,
    MessageContent,
    MessageContentPart,
    MessageRole,
    SettingsValues,
} from '../../types';

const createId = () =>
    globalThis.crypto?.randomUUID?.() ?? `id-${Date.now()}-${Math.random()}`;

const formatTimestamp = () =>
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const formatDate = () =>
    new Date().toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' });

const DEFAULT_TITLE = 'Новый чат';

const getTextFromContent = (content: MessageContent) => {
    if (typeof content === 'string') {
        return content;
    }

    return content
        .filter((part): part is { type: 'text'; text: string } => part.type === 'text')
        .map((part) => part.text)
        .join(' ');
};

const buildTitleFromMessage = (content: MessageContent) => {
    const trimmed = getTextFromContent(content).trim();
    if (trimmed.length < 3) {
        return DEFAULT_TITLE;
    }
    return trimmed.length > 40 ? `${trimmed.slice(0, 40)}…` : trimmed;
};

const buildPreview = (content: MessageContent) => {
    const trimmed = getTextFromContent(content).trim();
    if (!trimmed) {
        return '';
    }
    return trimmed.length > 70 ? `${trimmed.slice(0, 70)}…` : trimmed;
};

const createEmptyChat = (): Chat => ({
    id: createId(),
    title: DEFAULT_TITLE,
    lastMessageDate: '',
    preview: '',
    messages: [],
});

export const initialState: ChatState = {
    chats: [],
    activeChatId: '',
    isLoading: false,
    error: null,
};

export const chatReducer = (state: ChatState, action: ChatAction): ChatState => {
    switch (action.type) {
        case 'INIT':
            return {
                ...state,
                chats: action.payload.chats,
                activeChatId: action.payload.activeChatId ?? '',
            };
        case 'CREATE_CHAT':
            return {
                ...state,
                chats: [action.payload, ...state.chats],
                activeChatId: action.payload.id,
            };
        case 'SET_ACTIVE_CHAT':
            return {
                ...state,
                activeChatId: action.payload,
            };
        case 'UPDATE_CHAT':
            return {
                ...state,
                chats: state.chats.map((chat) =>
                    chat.id === action.payload.id ? action.payload : chat
                ),
            };
        case 'DELETE_CHAT': {
            const nextChats = state.chats.filter((chat) => chat.id !== action.payload);
            const nextActive =
                state.activeChatId === action.payload
                    ? nextChats[0]?.id ?? ''
                    : state.activeChatId;
            return {
                ...state,
                chats: nextChats,
                activeChatId: nextActive,
            };
        }
        case 'ADD_MESSAGE': {
            const { chatId, message } = action.payload;
            return {
                ...state,
                chats: state.chats.map((chat) => {
                    if (chat.id !== chatId) {
                        return chat;
                    }
                    const nextMessages = [...chat.messages, message];
                    const nextPreview = buildPreview(message.content) || chat.preview;
                    const isFirstUserMessage =
                        message.role === 'user' &&
                        chat.title === DEFAULT_TITLE &&
                        chat.messages.length === 0;
                    const nextTitle = isFirstUserMessage
                        ? buildTitleFromMessage(message.content)
                        : chat.title;
                    return {
                        ...chat,
                        messages: nextMessages,
                        lastMessageDate: formatDate(),
                        preview: nextPreview,
                        title: nextTitle,
                    };
                }),
            };
        }
        case 'UPDATE_MESSAGE': {
            const { chatId, messageId, content } = action.payload;
            return {
                ...state,
                chats: state.chats.map((chat) => {
                    if (chat.id !== chatId) {
                        return chat;
                    }
                    const nextMessages = chat.messages.map((message) =>
                        message.id === messageId ? { ...message, content } : message
                    );
                    const nextPreview = buildPreview(content) || chat.preview;
                    return {
                        ...chat,
                        messages: nextMessages,
                        preview: nextPreview,
                    };
                }),
            };
        }
        case 'SET_LOADING':
            return {
                ...state,
                isLoading: action.payload,
            };
        case 'SET_ERROR':
            return {
                ...state,
                error: action.payload,
            };
        default:
            return state;
    }
};

interface ChatContextValue extends ChatState {
    isHydrated: boolean;
    activeChat: Chat | null;
    settings: SettingsValues;
    updateSettings: (settings: Partial<SettingsValues>) => void;
    createChat: () => string;
    selectChat: (chatId: string) => void;
    deleteChat: (chatId: string) => void;
    renameChat: (chatId: string, title: string) => void;
    sendMessage: (payload: string | { text: string; imageUrl?: string }) => Promise<void>;
    retryLastMessage: () => Promise<void>;
    stopGeneration: () => void;
    getChatById: (chatId: string) => Chat | null;
}

const ChatContext = createContext<ChatContextValue | undefined>(undefined);

interface ChatProviderProps {
    children: ReactNode;
    model: string;
    systemPrompt: string;
    temperature: number;
    topP: number;
    maxTokens: number;
    repetitionPenalty?: number;
    enableStreaming?: boolean;
}

export function ChatProvider({
    children,
    model,
    systemPrompt,
    temperature,
    topP,
    maxTokens,
    repetitionPenalty = 1,
    enableStreaming = true,
}: ChatProviderProps) {
    const [state, dispatch] = useReducer(chatReducer, initialState);
    const stateRef = useRef(state);
    const abortRef = useRef<AbortController | null>(null);
    const lastUserMessageRef = useRef<{ text: string; imageUrl?: string }>({ text: '' });
    const [isHydrated, setIsHydrated] = useState(false);
    const [settings, setSettings] = useState<SettingsValues>({
        model,
        systemPrompt,
        temperature,
        topP,
        maxTokens,
        repetitionPenalty,
    });

    useEffect(() => {
        stateRef.current = state;
    }, [state]);

    useEffect(() => {
        const stored = loadChatState();
        if (stored) {
            dispatch({ type: 'INIT', payload: stored });
        }
        setIsHydrated(true);
    }, []);

    useEffect(() => {
        saveChatState({
            chats: state.chats,
            activeChatId: state.activeChatId,
        });
    }, [state.chats, state.activeChatId]);

    const activeChat = useMemo(
        () => state.chats.find((chat) => chat.id === state.activeChatId) ?? null,
        [state.chats, state.activeChatId]
    );

    const createChat = useCallback(() => {
        const chat = createEmptyChat();
        dispatch({ type: 'CREATE_CHAT', payload: chat });
        return chat.id;
    }, []);

    const selectChat = useCallback((chatId: string) => {
        dispatch({ type: 'SET_ACTIVE_CHAT', payload: chatId });
    }, []);

    const deleteChat = useCallback((chatId: string) => {
        dispatch({ type: 'DELETE_CHAT', payload: chatId });
    }, []);

    const renameChat = useCallback((chatId: string, title: string) => {
        const current = stateRef.current.chats.find((chat) => chat.id === chatId);
        if (!current) {
            return;
        }
        dispatch({ type: 'UPDATE_CHAT', payload: { ...current, title } });
    }, []);

    const getChatById = useCallback((chatId: string) => {
        return stateRef.current.chats.find((chat) => chat.id === chatId) ?? null;
    }, []);

    const stopGeneration = useCallback(() => {
        abortRef.current?.abort();
        dispatch({ type: 'SET_LOADING', payload: false });
    }, []);

    const sendMessage = useCallback(
        async (payload: string | { text: string; imageUrl?: string }) => {
            const normalized =
                typeof payload === 'string'
                    ? { text: payload, imageUrl: undefined }
                    : payload;
            const trimmed = normalized.text.trim();
            if (!trimmed || stateRef.current.isLoading) {
                return;
            }

            lastUserMessageRef.current = normalized;

            let chat = stateRef.current.chats.find(
                (item) => item.id === stateRef.current.activeChatId
            );

            if (!chat) {
                chat = createEmptyChat();
                dispatch({ type: 'CREATE_CHAT', payload: chat });
            }

            const chatId = chat.id;
            const content: MessageContent = normalized.imageUrl
                ? ([
                    { type: 'text', text: trimmed },
                    { type: 'image_url', image_url: { url: normalized.imageUrl } },
                ] satisfies MessageContentPart[])
                : trimmed;

            const userMessage: Message = {
                id: createId(),
                role: 'user',
                content,
                timestamp: formatTimestamp(),
            };

            dispatch({ type: 'ADD_MESSAGE', payload: { chatId, message: userMessage } });

            dispatch({ type: 'SET_ERROR', payload: null });
            dispatch({ type: 'SET_LOADING', payload: true });

            const assistantMessageId = createId();
            dispatch({
                type: 'ADD_MESSAGE',
                payload: {
                    chatId,
                    message: {
                        id: assistantMessageId,
                        role: 'assistant',
                        content: '',
                        timestamp: formatTimestamp(),
                    },
                },
            });

            const prompt = settings.systemPrompt.trim();
            const requestMessages = [
                ...(prompt
                    ? ([{ role: 'system', content: prompt }] as Array<{
                        role: MessageRole;
                        content: string | MessageContentPart[];
                    }>)
                    : []),
                ...[...chat.messages, userMessage].map((message) => ({
                    role: message.role,
                    content: message.content,
                })),
            ];

            abortRef.current?.abort();
            const controller = new AbortController();
            abortRef.current = controller;

            const updateAssistant = (content: string) =>
                dispatch({
                    type: 'UPDATE_MESSAGE',
                    payload: { chatId, messageId: assistantMessageId, content },
                });

            try {
                if (enableStreaming) {
                    let aggregated = '';
                    await streamChatCompletion(
                        {
                            model: settings.model,
                            messages: requestMessages,
                            temperature: settings.temperature,
                            top_p: settings.topP,
                            max_tokens: settings.maxTokens,
                            repetition_penalty: settings.repetitionPenalty,
                            stream: true,
                        },
                        (delta) => {
                            aggregated += delta;
                            updateAssistant(aggregated);
                        },
                        controller.signal
                    );
                } else {
                    const content = await createChatCompletion(
                        {
                            model: settings.model,
                            messages: requestMessages,
                            temperature: settings.temperature,
                            top_p: settings.topP,
                            max_tokens: settings.maxTokens,
                            repetition_penalty: settings.repetitionPenalty,
                        },
                        controller.signal
                    );
                    updateAssistant(content);
                }
            } catch (error) {
                if ((error as Error).name !== 'AbortError') {
                    try {
                        const content = await createChatCompletion(
                            {
                                model: settings.model,
                                messages: requestMessages,
                                temperature: settings.temperature,
                                top_p: settings.topP,
                                max_tokens: settings.maxTokens,
                                repetition_penalty: settings.repetitionPenalty,
                            },
                            controller.signal
                        );
                        updateAssistant(content);
                    } catch {
                        dispatch({ type: 'SET_ERROR', payload: 'Не удалось получить ответ от модели.' });
                    }
                }
            } finally {
                dispatch({ type: 'SET_LOADING', payload: false });
            }
        },
        [enableStreaming, settings]
    );

    const retryLastMessage = useCallback(async () => {
        const lastMessage = lastUserMessageRef.current;
        if (!lastMessage.text) {
            return;
        }

        await sendMessage(lastMessage);
    }, [sendMessage]);

    const updateSettings = useCallback((nextSettings: Partial<SettingsValues>) => {
        setSettings((current) => ({ ...current, ...nextSettings }));
    }, []);

    const value: ChatContextValue = {
        ...state,
        isHydrated,
        activeChat,
        settings,
        updateSettings,
        createChat,
        selectChat,
        deleteChat,
        renameChat,
        sendMessage,
        retryLastMessage,
        stopGeneration,
        getChatById,
    };

    return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export const useChat = () => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error('useChat must be used within ChatProvider');
    }
    return context;
};
