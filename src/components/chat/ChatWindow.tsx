import { useEffect, useLayoutEffect, useMemo, useRef, useState, type KeyboardEventHandler } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useChat } from '../../app/providers/ChatProvider';
import { MessageList } from './MessageList';
import styles from './ChatWindow.module.css';

export function ChatWindow() {
    const navigate = useNavigate();
    const params = useParams();
    const {
        activeChat,
        activeChatId,
        error,
        getChatById,
        isHydrated,
        isLoading,
        selectChat,
        sendMessage,
        stopGeneration,
    } = useChat();

    const chat = useMemo(() => {
        if (params.id) {
            return getChatById(params.id);
        }
        return activeChat;
    }, [params.id, getChatById, activeChat]);

    useEffect(() => {
        if (params.id) {
            if (isHydrated && !chat) {
                navigate('/', { replace: true });
                return;
            }
            if (params.id !== activeChatId) {
                selectChat(params.id);
            }
        }
    }, [params.id, chat, navigate, activeChatId, selectChat, isHydrated]);

    return (
        <section className={styles.window}>
            <header className={styles.header}>
                <div>
                    <p className={styles.eyebrow}>Текущий диалог</p>
                    <h2 className={styles.title}>{chat?.title ?? 'Новый чат'}</h2>
                </div>
            </header>

            {error ? <ErrorMessage message={error} /> : null}

            {chat?.messages.length ? (
                <MessageList isTypingVisible={isLoading} messages={chat.messages} />
            ) : (
                <EmptyState />
            )}

            <InputArea
                isLoading={isLoading}
                onSend={sendMessage}
                onStop={stopGeneration}
            />
        </section>
    );
}

interface InputAreaProps {
    isLoading?: boolean;
    onSend: (text: string) => void;
    onStop: () => void;
}

function InputArea({ isLoading, onSend, onStop }: InputAreaProps) {
    const [text, setText] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);

    useLayoutEffect(() => {
        const element = textareaRef.current;
        if (!element) {
            return;
        }

        element.style.height = 'auto';
        const lineHeight = 24;
        const maxHeight = lineHeight * 5;
        element.style.height = `${Math.min(element.scrollHeight, maxHeight)}px`;
    }, [text]);

    const handleKeyDown: KeyboardEventHandler<HTMLTextAreaElement> = (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();

            if (text.trim() && !isLoading) {
                onSend(text.trim());
                setText('');
            }
        }
    };

    const handleSendClick = () => {
        if (text.trim() && !isLoading) {
            onSend(text.trim());
            setText('');
        }
    };

    return (
        <div className={styles.inputWrapper}>
            <button aria-label="Прикрепить изображение" className={styles.iconButton} type="button" disabled={isLoading}>
                🖼
            </button>

            <textarea
                className={styles.textarea}
                onChange={(event) => setText(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Введите сообщение..."
                ref={textareaRef}
                rows={1}
                value={text}
                disabled={isLoading}
            />

            <div className={styles.actions}>
                {isLoading ? (
                    <button className={[styles.button, styles.ghostButton].join(' ')} onClick={onStop} type="button">
                        Стоп
                    </button>
                ) : (
                    <button
                        className={[styles.button, styles.primaryButton].join(' ')}
                        disabled={!text.trim()}
                        onClick={handleSendClick}
                        type="button"
                    >
                        Отправить
                    </button>
                )}
            </div>
        </div>
    );
}

function EmptyState() {
    return (
        <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>✦</div>
            <h3>Начните новый диалог</h3>
            <p>Выберите чат слева или создайте новый, чтобы увидеть сообщения здесь.</p>
        </div>
    );
}

interface ErrorMessageProps {
    message: string;
}

function ErrorMessage({ message }: ErrorMessageProps) {
    return (
        <div className={styles.errorMessage} role="alert">
            <span>⚠</span>
            <span>{message}</span>
        </div>
    );
}