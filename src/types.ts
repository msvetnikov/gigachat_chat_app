export type ThemeMode = 'light' | 'dark';

export type ScopeOption =
    | 'GIGACHAT_API_PERS'
    | 'GIGACHAT_API_B2B'
    | 'GIGACHAT_API_CORP';

export type ModelOption =
    | 'GigaChat'
    | 'GigaChat-Plus'
    | 'GigaChat-Pro'
    | 'GigaChat-Max';

export type MessageVariant = 'user' | 'assistant';

export type MessageRole = 'system' | 'user' | 'assistant';

export type MessageContentPart =
    | { type: 'text'; text: string }
    | { type: 'image_url'; image_url: { url: string } };

export type MessageContent = string | MessageContentPart[];

export interface Message {
    id: string;
    role: MessageRole;
    content: MessageContent;
    timestamp: string;
}

export interface Chat {
    id: string;
    title: string;
    lastMessageDate: string;
    preview: string;
    messages: Message[];
}

export interface ChatState {
    chats: Chat[];
    activeChatId: string;
    isLoading: boolean;
    error: string | null;
}

export type ChatAction =
    | { type: 'INIT'; payload: { chats: Chat[]; activeChatId: string } }
    | { type: 'CREATE_CHAT'; payload: Chat }
    | { type: 'SET_ACTIVE_CHAT'; payload: string }
    | { type: 'UPDATE_CHAT'; payload: Chat }
    | { type: 'DELETE_CHAT'; payload: string }
    | { type: 'ADD_MESSAGE'; payload: { chatId: string; message: Message } }
    | { type: 'UPDATE_MESSAGE'; payload: { chatId: string; messageId: string; content: string } }
    | { type: 'SET_LOADING'; payload: boolean }
    | { type: 'SET_ERROR'; payload: string | null };

export interface SettingsValues {
    model: ModelOption;
    temperature: number;
    topP: number;
    maxTokens: number;
    systemPrompt: string;
    repetitionPenalty: number;
}