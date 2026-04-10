import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Chat } from '../types';
import { loadChatState, saveChatState } from './storage';

const createStorageMock = () => {
    let store: Record<string, string> = {};

    return {
        getItem: vi.fn((key: string) => (key in store ? store[key] : null)),
        setItem: vi.fn((key: string, value: string) => {
            store[key] = String(value);
        }),
        removeItem: vi.fn((key: string) => {
            delete store[key];
        }),
        clear: vi.fn(() => {
            store = {};
        }),
    };
};

describe('storage', () => {
    let storageMock: ReturnType<typeof createStorageMock>;

    beforeEach(() => {
        storageMock = createStorageMock();
        vi.stubGlobal('localStorage', storageMock);
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('saves chat state to localStorage', () => {
        saveChatState({ chats: [], activeChatId: '' });

        expect(storageMock.setItem).toHaveBeenCalledTimes(1);
        expect(storageMock.setItem).toHaveBeenCalledWith(
            'gigachat_ui_state',
            JSON.stringify({ chats: [], activeChatId: '' })
        );
    });

    it('loads chat state from localStorage', () => {
        const chat: Chat = {
            id: 'chat-1',
            title: 'Chat',
            lastMessageDate: '',
            preview: '',
            messages: [],
        };
        storageMock.setItem(
            'gigachat_ui_state',
            JSON.stringify({ chats: [chat], activeChatId: 'chat-1' })
        );

        const result = loadChatState();

        expect(result).toEqual({ chats: [chat], activeChatId: 'chat-1' });
    });

    it('returns null for invalid JSON data', () => {
        storageMock.setItem('gigachat_ui_state', '{bad json');

        expect(loadChatState()).toBeNull();
    });

    it('returns null for invalid shape data', () => {
        storageMock.setItem(
            'gigachat_ui_state',
            JSON.stringify({ chats: 'nope', activeChatId: 'chat-1' })
        );

        expect(loadChatState()).toBeNull();
    });
});
