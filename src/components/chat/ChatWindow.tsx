import { useEffect, useState } from 'react';
import type { ChatData, MessageData } from '../../types';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';
import { InputArea } from './InputArea';
import { MessageList } from './MessageList';
import styles from './ChatWindow.module.css';

interface ChatWindowProps {
    chat: ChatData | null;
    onOpenSettings: () => void;
    onStop: () => void;
}

export function ChatWindow({
    chat,
    onOpenSettings,
    onStop,
}: ChatWindowProps) {
    const [messages, setMessages] = useState<MessageData[]>(chat?.messages ?? []);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setMessages(chat?.messages ?? []);
        setIsLoading(false);
    }, [chat?.id]);

    const handleSend = (text: string) => {
        const userMsg: MessageData = {
            id: Date.now().toString(),
            role: 'user',
            content: text,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages((prev) => [...prev, userMsg]);
        setIsLoading(true);

        setTimeout(() => {
            const assistantMsg: MessageData = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: 'Эта функциональность симулирована. В будущем здесь будет ответ от API GigaChat, поддерживающий **markdown**, списки и код.',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
            setMessages((prev) => [...prev, assistantMsg]);
            setIsLoading(false);
        }, 1500);
    };

    return (
        <section className={styles.window}>
            <header className={styles.header}>
                <div>
                    <p className={styles.eyebrow}>Текущий диалог</p>
                    <h2 className={styles.title}>{chat?.title ?? 'Новый чат'}</h2>
                </div>
                <Button icon="⚙" onClick={onOpenSettings} variant="ghost">
                    Настройки
                </Button>
            </header>

            {messages.length > 0 ? (
                <MessageList isTypingVisible={isLoading} messages={messages} />
            ) : (
                <EmptyState />
            )}

            <InputArea
                isLoading={isLoading}
                onSend={handleSend}
                onStop={onStop}
            />
        </section>
    );
}