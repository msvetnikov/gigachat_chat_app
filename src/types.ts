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

export interface MessageData {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
}

export interface ChatData {
    id: string;
    title: string;
    lastMessageDate: string;
    preview: string;
    messages: MessageData[];
}

export interface SettingsValues {
    model: ModelOption;
    temperature: number;
    topP: number;
    maxTokens: number;
    systemPrompt: string;
}