import type { ChatData } from '../../types';
import styles from './ChatItem.module.css';

interface ChatItemProps {
    chat: ChatData;
    isActive: boolean;
    onDelete: (chatId: string) => void;
    onEdit: (chatId: string) => void;
    onSelect: (chatId: string) => void;
}

export function ChatItem({
    chat,
    isActive,
    onDelete,
    onEdit,
    onSelect,
}: ChatItemProps) {
    return (
        <button
            className={[styles.item, isActive ? styles.active : ''].join(' ')}
            onClick={() => onSelect(chat.id)}
            type="button"
        >
            <div className={styles.row}>
                <span className={styles.title} title={chat.title}>
                    {chat.title}
                </span>
                <span className={styles.date}>{chat.lastMessageDate}</span>
            </div>
            <p className={styles.preview}>{chat.preview}</p>
            <div className={styles.actions}>
                <button
                    aria-label="Редактировать чат"
                    className={styles.actionButton}
                    onClick={(event) => {
                        event.stopPropagation();
                        onEdit(chat.id);
                    }}
                    type="button"
                >
                    ✎
                </button>
                <button
                    aria-label="Удалить чат"
                    className={styles.actionButton}
                    onClick={(event) => {
                        event.stopPropagation();
                        onDelete(chat.id);
                    }}
                    type="button"
                >
                    🗑
                </button>
            </div>
        </button>
    );
}