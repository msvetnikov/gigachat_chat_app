import type { ChatData } from '../../types';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';
import { InputArea } from './InputArea';
import { MessageList } from './MessageList';
import styles from './ChatWindow.module.css';

interface ChatWindowProps {
    chat: ChatData | null;
    draftValue: string;
    isTypingVisible: boolean;
    onChangeDraft: (value: string) => void;
    onOpenSettings: () => void;
    onSend: () => void;
    onStop: () => void;
}

export function ChatWindow({
    chat,
    draftValue,
    isTypingVisible,
    onChangeDraft,
    onOpenSettings,
    onSend,
    onStop,
}: ChatWindowProps) {
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

            {chat && chat.messages.length > 0 ? (
                <MessageList isTypingVisible={isTypingVisible} messages={chat.messages} />
            ) : (
                <EmptyState />
            )}

            <InputArea
                value={draftValue}
                onChange={onChangeDraft}
                onSend={onSend}
                onStop={onStop}
            />
        </section>
    );
}