import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import { ChatProvider } from '../../app/providers/ChatProvider';
import type { Chat } from '../../types';
import { Sidebar } from './Sidebar';
import { loadChatState } from '../../utils/storage';

vi.mock('../../utils/storage', () => ({
    loadChatState: vi.fn(),
    saveChatState: vi.fn(),
}));

const sampleChats: Chat[] = [
    {
        id: 'chat-1',
        title: 'Alpha',
        lastMessageDate: '',
        preview: 'Preview alpha',
        messages: [
            {
                id: 'm-1',
                role: 'user',
                content: 'Alpha content',
                timestamp: '10:00',
            },
        ],
    },
    {
        id: 'chat-2',
        title: 'Beta',
        lastMessageDate: '',
        preview: 'Preview beta',
        messages: [],
    },
];

const renderSidebar = () =>
    render(
        <MemoryRouter>
            <ChatProvider
                model="GigaChat"
                systemPrompt=""
                temperature={0.7}
                topP={0.9}
                maxTokens={1024}
            >
                <Sidebar isOpen={true} onClose={() => undefined} />
            </ChatProvider>
        </MemoryRouter>
    );

describe('Sidebar', () => {
    beforeEach(() => {
        vi.mocked(loadChatState).mockReturnValue({
            chats: sampleChats,
            activeChatId: 'chat-1',
        });
    });

    it('filters chats by title when search query is set', async () => {
        const user = userEvent.setup();
        renderSidebar();

        await screen.findByText('Alpha');

        const input = screen.getByPlaceholderText('Поиск по чатам');
        await user.type(input, 'beta');

        expect(screen.getByText('Beta')).toBeInTheDocument();
        expect(screen.queryByText('Alpha')).toBeNull();
    });

    it('shows all chats when search query is empty', async () => {
        const user = userEvent.setup();
        renderSidebar();

        await screen.findByText('Alpha');

        const input = screen.getByPlaceholderText('Поиск по чатам');
        await user.type(input, 'alpha');
        await user.clear(input);

        expect(screen.getByText('Alpha')).toBeInTheDocument();
        expect(screen.getByText('Beta')).toBeInTheDocument();
    });

    it('shows confirmation modal after clicking delete', async () => {
        const user = userEvent.setup();
        renderSidebar();

        const deleteButtons = await screen.findAllByLabelText('Удалить чат');
        await user.click(deleteButtons[0]);

        expect(screen.getByText('Удалить чат')).toBeInTheDocument();
    });
});
