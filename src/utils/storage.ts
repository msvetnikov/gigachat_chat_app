import type { Chat, ChatState } from '../types';

const STORAGE_KEY = 'gigachat_ui_state';

type PersistedChatState = Pick<ChatState, 'chats' | 'activeChatId'>;

const isChatArray = (value: unknown): value is Chat[] => Array.isArray(value);

export const loadChatState = (): PersistedChatState | null => {
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) {
            return null;
        }

        const parsed = JSON.parse(raw) as PersistedChatState | null;
        if (!parsed || !isChatArray(parsed.chats)) {
            return null;
        }

        return {
            chats: parsed.chats,
            activeChatId: parsed.activeChatId ?? '',
        };
    } catch {
        return null;
    }
};

export const saveChatState = (state: PersistedChatState) => {
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
        // Ignore storage write errors to avoid breaking the UI.
    }
};
