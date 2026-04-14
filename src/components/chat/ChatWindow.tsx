import { Suspense, lazy, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type KeyboardEventHandler } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useChat } from '../../app/providers/ChatProvider';
import { ErrorBoundary } from '../ErrorBoundary';
import styles from './ChatWindow.module.css';

const LazyMessageList = lazy(() =>
    import('./MessageList').then((module) => ({ default: module.MessageList }))
);

const LazySettingsPanel = lazy(() =>
    import('../SettingsPanel').then((module) => ({ default: module.SettingsPanel }))
);

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
        retryLastMessage,
        stopGeneration,
    } = useChat();
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

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

    const handleSend = useCallback(
        async (text: string) => {
            await sendMessage(text);
        },
        [sendMessage]
    );

    const handleStop = useCallback(() => {
        stopGeneration();
    }, [stopGeneration]);

    return (
        <section className={styles.window}>
            <header className={styles.header}>
                <div>
                    <p className={styles.eyebrow}>Текущий диалог</p>
                    <h2 className={styles.title}>{chat?.title ?? 'Новый чат'}</h2>
                </div>
                <button
                    className={[styles.button, styles.ghostButton].join(' ')}
                    onClick={() => setIsSettingsOpen(true)}
                    type="button"
                >
                    Настройки
                </button>
            </header>

            <ErrorBoundary>
                {chat?.messages.length ? (
                    <Suspense fallback={<MessageListFallback />}>
                        <LazyMessageList isTypingVisible={isLoading} messages={chat.messages} />
                    </Suspense>
                ) : (
                    <EmptyState />
                )}
            </ErrorBoundary>

            <div>
                <InputArea
                    isLoading={isLoading}
                    onSend={handleSend}
                    onStop={handleStop}
                />
                {error ? (
                    <ErrorMessage message={error} onRetry={retryLastMessage} />
                ) : null}
            </div>

            <Suspense fallback={null}>
                <LazySettingsPanel isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
            </Suspense>
        </section>
    );
}

interface InputAreaProps {
    isLoading?: boolean;
    onSend: (text: string) => void;
    onStop: () => void;
}

export function InputArea({ isLoading, onSend, onStop }: InputAreaProps) {
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
    onRetry?: () => void;
}

function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
    return (
        <div className={styles.errorMessage} role="alert">
            <span>⚠</span>
            <span>{message}</span>
            {onRetry ? (
                <button className={[styles.button, styles.ghostButton].join(' ')} onClick={onRetry} type="button">
                    Повторить
                </button>
            ) : null}
        </div>
    );
}

function MessageListFallback() {
    return (
        <div className={styles.messageFallback}>
            Загрузка сообщений...
        </div>
    );
}