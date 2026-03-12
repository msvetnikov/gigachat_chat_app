import type { ChatData } from '../../types';
import { Button } from '../ui/Button';
import { ChatList } from './ChatList';
import { SearchInput } from './SearchInput';
import styles from './Sidebar.module.css';

interface SidebarProps {
    activeChatId: string;
    chats: ChatData[];
    isOpen: boolean;
    searchValue: string;
    onDeleteChat: (chatId: string) => void;
    onEditChat: (chatId: string) => void;
    onNewChat: () => void;
    onSearchChange: (value: string) => void;
    onSelectChat: (chatId: string) => void;
}

export function Sidebar({
    activeChatId,
    chats,
    isOpen,
    searchValue,
    onDeleteChat,
    onEditChat,
    onNewChat,
    onSearchChange,
    onSelectChat,
}: SidebarProps) {
    return (
        <aside className={[styles.sidebar, isOpen ? styles.open : ''].join(' ')}>
            <div className={styles.header}>
                <div>
                    <p className={styles.eyebrow}>Учебный проект</p>
                    <h1 className={styles.title}>GigaChat UI</h1>
                </div>
                <Button icon="+" onClick={onNewChat} variant="primary">
                    Новый чат
                </Button>
            </div>

            <SearchInput value={searchValue} onChange={onSearchChange} />

            <ChatList
                activeChatId={activeChatId}
                chats={chats}
                onDeleteChat={onDeleteChat}
                onEditChat={onEditChat}
                onSelectChat={onSelectChat}
            />
        </aside>
    );
}