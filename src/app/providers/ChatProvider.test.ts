import { describe, expect, it } from 'vitest';
import { chatReducer, initialState } from './ChatProvider';
import type { Chat, Message } from '../../types';

const createChat = (id: string, title = 'Chat'): Chat => ({
    id,
    title,
    lastMessageDate: '',
    preview: '',
    messages: [],
});

describe('chatReducer', () => {
    it('adds message to the end of chat messages', () => {
        const existingMessage: Message = {
            id: 'm-1',
            role: 'user',
            content: 'First',
            timestamp: '10:00',
        };
        const newMessage: Message = {
            id: 'm-2',
            role: 'user',
            content: 'Second',
            timestamp: '10:01',
        };
        const chat = {
            ...createChat('chat-1'),
            messages: [existingMessage],
        };

        const nextState = chatReducer(
            { ...initialState, chats: [chat], activeChatId: 'chat-1' },
            { type: 'ADD_MESSAGE', payload: { chatId: 'chat-1', message: newMessage } }
        );

        expect(nextState.chats[0].messages).toHaveLength(2);
        expect(nextState.chats[0].messages[1]).toEqual(newMessage);
    });

    it('creates a chat and makes it active', () => {
        const existingChat = createChat('chat-1');
        const newChat = createChat('chat-2');

        const nextState = chatReducer(
            { ...initialState, chats: [existingChat], activeChatId: 'chat-1' },
            { type: 'CREATE_CHAT', payload: newChat }
        );

        expect(nextState.chats).toHaveLength(2);
        expect(nextState.chats[0].id).toBe('chat-2');
        expect(nextState.activeChatId).toBe('chat-2');
    });

    it('deletes active chat and switches to the next one', () => {
        const firstChat = createChat('chat-1');
        const secondChat = createChat('chat-2');

        const nextState = chatReducer(
            { ...initialState, chats: [firstChat, secondChat], activeChatId: 'chat-1' },
            { type: 'DELETE_CHAT', payload: 'chat-1' }
        );

        expect(nextState.chats).toHaveLength(1);
        expect(nextState.activeChatId).toBe('chat-2');
    });

    it('renames chat by id', () => {
        const chat = createChat('chat-1', 'Old title');

        const nextState = chatReducer(
            { ...initialState, chats: [chat], activeChatId: 'chat-1' },
            { type: 'UPDATE_CHAT', payload: { ...chat, title: 'New title' } }
        );

        expect(nextState.chats[0].title).toBe('New title');
    });
});
