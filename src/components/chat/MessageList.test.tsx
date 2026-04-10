import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { Message as MessageType } from '../../types';
import { Message } from './MessageList';
import styles from './MessageList.module.css';

describe('Message', () => {
    it('renders user message with user styles and without copy button', () => {
        const message: MessageType = {
            id: 'm-1',
            role: 'user',
            content: 'User text',
            timestamp: '10:00',
        };

        const { container } = render(<Message message={message} variant="user" />);

        expect(screen.getByText('User text')).toBeInTheDocument();
        const article = container.querySelector('article');
        expect(article).toHaveClass(styles.user);
        expect(article).not.toHaveClass(styles.assistant);
        expect(screen.queryByRole('button', { name: 'Копировать' })).toBeNull();
    });

    it('renders assistant message with assistant styles and copy button', () => {
        const message: MessageType = {
            id: 'm-2',
            role: 'assistant',
            content: 'Assistant text',
            timestamp: '10:01',
        };

        const { container } = render(<Message message={message} variant="assistant" />);

        expect(screen.getByText('Assistant text')).toBeInTheDocument();
        const article = container.querySelector('article');
        expect(article).toHaveClass(styles.assistant);
        expect(article).not.toHaveClass(styles.user);
        expect(screen.getByRole('button', { name: 'Копировать' })).toBeInTheDocument();
    });
});
