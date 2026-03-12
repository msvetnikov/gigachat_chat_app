import type { ChatData } from '../../types';
import { ChatItem } from './ChatItem';
import styles from './ChatList.module.css';

interface ChatListProps {
    activeChatId: string;
    chats: ChatData[];
    onDeleteChat: (chatId: string) => void;
    onEditChat: (chatId: string) => void;
    onSelectChat: (chatId: string) => void;
}

export function ChatList({
    activeChatId,
    chats,
    onDeleteChat,
    onEditChat,
    onSelectChat,
}: ChatListProps) {
    return (
        <div className={styles.list}>
            {chats.map((chat) => (
                <ChatItem
                    key={chat.id}
                    chat={chat}
                    isActive={chat.id === activeChatId}
                    onDelete={onDeleteChat}
                    onEdit={onEditChat}
                    onSelect={onSelectChat}
                />
            ))}
        </div>
    );
}