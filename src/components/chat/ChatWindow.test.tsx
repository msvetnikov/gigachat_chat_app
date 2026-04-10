import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { InputArea } from './ChatWindow';

describe('InputArea', () => {
    it('calls onSend when clicking send with text', async () => {
        const user = userEvent.setup();
        const onSend = vi.fn();

        render(<InputArea isLoading={false} onSend={onSend} onStop={vi.fn()} />);

        await user.type(screen.getByPlaceholderText('Введите сообщение...'), 'Привет');
        await user.click(screen.getByRole('button', { name: 'Отправить' }));

        expect(onSend).toHaveBeenCalledWith('Привет');
    });

    it('calls onSend on Enter with non-empty input', async () => {
        const user = userEvent.setup();
        const onSend = vi.fn();

        render(<InputArea isLoading={false} onSend={onSend} onStop={vi.fn()} />);

        await user.type(screen.getByPlaceholderText('Введите сообщение...'), 'Hello{enter}');

        expect(onSend).toHaveBeenCalledWith('Hello');
    });

    it('disables send button for empty input', () => {
        render(<InputArea isLoading={false} onSend={vi.fn()} onStop={vi.fn()} />);

        expect(screen.getByRole('button', { name: 'Отправить' })).toBeDisabled();
    });
});
