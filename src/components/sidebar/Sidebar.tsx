import { memo, useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChats } from '../../hooks/useChats';
import type { Chat } from '../../types';
import styles from './Sidebar.module.css';

type ModalMode = 'rename' | 'delete' | null;

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export function Sidebar({
    isOpen,
    onClose,
}: SidebarProps) {
    const navigate = useNavigate();
    const { chats, activeChatId, createChat, deleteChat, renameChat, selectChat } = useChats();
    const [searchValue, setSearchValue] = useState('');
    const [modalMode, setModalMode] = useState<ModalMode>(null);
    const [activeModalChatId, setActiveModalChatId] = useState<string | null>(null);
    const [draftTitle, setDraftTitle] = useState('');

const filteredChats = useMemo(() => {
    const query = searchValue.trim().toLowerCase();
    if (!query) {
        return chats;
    }

    return chats.filter((chat) => {
        const lastMessage = chat.messages[chat.messages.length - 1]?.content ?? '';
        
        // Превращаем контент в строку, прежде чем делать toLowerCase()
        const lastMessageText = typeof lastMessage === 'string' 
            ? lastMessage 
            : lastMessage
                .filter((part): part is { type: 'text'; text: string } => 'text' in part)
                .map(part => part.text)
                .join(' ');

        return (
            chat.title.toLowerCase().includes(query) ||
            lastMessageText.toLowerCase().includes(query)
        );
    });
}, [chats, searchValue]);

    const handleNewChat = useCallback(() => {
        const chatId = createChat();
        navigate(`/chat/${chatId}`);
        onClose();
    }, [createChat, navigate, onClose]);

    const handleSelectChat = useCallback((chatId: string) => {
        selectChat(chatId);
        navigate(`/chat/${chatId}`);
        onClose();
    }, [navigate, onClose, selectChat]);

    const handleEditChat = useCallback((chatId: string) => {
        const current = chats.find((chat) => chat.id === chatId);
        if (!current) {
            return;
        }
        setDraftTitle(current.title);
        setActiveModalChatId(chatId);
        setModalMode('rename');
    }, [chats]);

    const handleDeleteChat = useCallback((chatId: string) => {
        setActiveModalChatId(chatId);
        setModalMode('delete');
    }, []);

    const closeModal = useCallback(() => {
        setModalMode(null);
        setActiveModalChatId(null);
        setDraftTitle('');
    }, []);

    const handleRenameConfirm = useCallback(() => {
        if (!activeModalChatId) {
            return;
        }
        const nextTitle = draftTitle.trim();
        if (nextTitle) {
            renameChat(activeModalChatId, nextTitle);
        }
        closeModal();
    }, [activeModalChatId, closeModal, draftTitle, renameChat]);

    const handleDeleteConfirm = useCallback(() => {
        if (!activeModalChatId) {
            return;
        }
        deleteChat(activeModalChatId);
        if (activeModalChatId === activeChatId) {
            navigate('/');
        }
        closeModal();
    }, [activeChatId, activeModalChatId, closeModal, deleteChat, navigate]);

    return (
        <aside className={[styles.sidebar, isOpen ? styles.open : ''].join(' ')}>
            <div className={styles.header}>
                <div>
                    <p className={styles.eyebrow}>Учебный проект</p>
                    <h1 className={styles.headerTitle}>GigaChat UI</h1>
                </div>
                <button className={[styles.button, styles.primaryButton].join(' ')} onClick={handleNewChat} type="button">
                    <span className={styles.buttonIcon}>+</span>
                    Новый чат
                </button>
            </div>

            <SearchInput value={searchValue} onChange={setSearchValue} />

            <ChatList
                activeChatId={activeChatId}
                chats={filteredChats}
                onDeleteChat={handleDeleteChat}
                onEditChat={handleEditChat}
                onSelectChat={handleSelectChat}
            />

            {modalMode ? (
                <div className={styles.modalOverlay} role="presentation">
                    <div className={styles.modalBackdrop} onClick={closeModal} />
                    <div
                        aria-labelledby="chat-modal-title"
                        aria-modal="true"
                        className={styles.modal}
                        role="dialog"
                    >
                        {modalMode === 'rename' ? (
                            <>
                                <h3 className={styles.modalTitle} id="chat-modal-title">
                                    Переименовать чат
                                </h3>
                                <label className={styles.modalField}>
                                    <span>Название</span>
                                    <input
                                        className={styles.modalInput}
                                        onChange={(event) => setDraftTitle(event.target.value)}
                                        value={draftTitle}
                                    />
                                </label>
                                <div className={styles.modalActions}>
                                    <button className={[styles.button, styles.primaryButton].join(' ')} onClick={handleRenameConfirm} type="button">
                                        Сохранить
                                    </button>
                                    <button className={[styles.button, styles.ghostButton].join(' ')} onClick={closeModal} type="button">
                                        Отмена
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <h3 className={styles.modalTitle} id="chat-modal-title">
                                    Удалить чат
                                </h3>
                                <p className={styles.modalText}>
                                    История сообщений будет удалена без возможности восстановления.
                                </p>
                                <div className={styles.modalActions}>
                                    <button className={[styles.button, styles.primaryButton].join(' ')} onClick={handleDeleteConfirm} type="button">
                                        Удалить
                                    </button>
                                    <button className={[styles.button, styles.ghostButton].join(' ')} onClick={closeModal} type="button">
                                        Отмена
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            ) : null}
        </aside>
    );
}

interface ChatListProps {
    activeChatId: string;
    chats: Chat[];
    onDeleteChat: (chatId: string) => void;
    onEditChat: (chatId: string) => void;
    onSelectChat: (chatId: string) => void;
}

function ChatList({ activeChatId, chats, onDeleteChat, onEditChat, onSelectChat }: ChatListProps) {
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

interface ChatItemProps {
    chat: Chat;
    isActive: boolean;
    onDelete: (chatId: string) => void;
    onEdit: (chatId: string) => void;
    onSelect: (chatId: string) => void;
}

const ChatItem = memo(function ChatItem({ chat, isActive, onDelete, onEdit, onSelect }: ChatItemProps) {
    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onSelect(chat.id);
        }
    };

    return (
        <div
            className={[styles.item, isActive ? styles.active : ''].join(' ')}
            onClick={() => onSelect(chat.id)}
            onKeyDown={handleKeyDown}
            role="button"
            tabIndex={0}
        >
            <div className={styles.row}>
                <span className={styles.chatTitle} title={chat.title}>
                    {chat.title}
                </span>
                <span className={styles.date}>{chat.lastMessageDate || ''}</span>
            </div>
            <p className={styles.preview}>{chat.preview || 'Нет сообщений'}</p>
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
        </div>
    );
});

ChatItem.displayName = 'ChatItem';

interface SearchInputProps {
    value: string;
    onChange: (value: string) => void;
}

function SearchInput({ value, onChange }: SearchInputProps) {
    return (
        <label className={styles.searchWrapper}>
            <span className={styles.searchIcon}>⌕</span>
            <input
                className={styles.searchInput}
                onChange={(event) => onChange(event.target.value)}
                placeholder="Поиск по чатам"
                type="search"
                value={value}
            />
        </label>
    );
}