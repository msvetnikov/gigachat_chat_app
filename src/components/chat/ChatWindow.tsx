import {
    Suspense,
    lazy,
    useCallback,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
    type ChangeEvent,
    type KeyboardEventHandler,
} from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useChat } from '../../app/providers/ChatProvider';
import { useMessages } from '../../hooks/useMessages';
import { useStreaming } from '../../hooks/useStreaming';
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
        activeChatId,
        error,
        isHydrated,
        selectChat,
        sendMessage,
        retryLastMessage,
    } = useChat();
    const { isLoading, stopGeneration } = useStreaming();
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const chat = useMessages(params.id);

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
        async (payload: string | { text: string; imageUrl?: string }) => {
            await sendMessage(payload);
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
                <InputArea isLoading={isLoading} onSend={handleSend} onStop={handleStop} />
                {error ? <ErrorMessage message={error} onRetry={retryLastMessage} /> : null}
            </div>

            <Suspense fallback={null}>
                <LazySettingsPanel isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
            </Suspense>
        </section>
    );
}

interface InputAreaProps {
    isLoading?: boolean;
    onSend: (payload: string | { text: string; imageUrl?: string }) => void;
    onStop: () => void;
}

export function InputArea({ isLoading, onSend, onStop }: InputAreaProps) {
    const [text, setText] = useState('');
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [imageName, setImageName] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

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

    const submitMessage = () => {
        if (!isLoading && (text.trim() || imageUrl)) {
            const trimmed = text.trim();
            const textForSend = trimmed || 'Изображение';
            if (imageUrl) {
                onSend({ text: textForSend, imageUrl });
            } else {
                onSend(textForSend);
            }
            setText('');
            setImageUrl(null);
            setImageName('');
        }
    };

    const handleKeyDown: KeyboardEventHandler<HTMLTextAreaElement> = (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            submitMessage();
        }
    };

    const handleSendClick = () => {
        submitMessage();
    };

    const handleAttachClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) {
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            const result = typeof reader.result === 'string' ? reader.result : null;
            if (result) {
                setImageUrl(result);
                setImageName(file.name);
            }
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveImage = () => {
        setImageUrl(null);
        setImageName('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const isSendDisabled = (!text.trim() && !imageUrl) || Boolean(isLoading);

    return (
        <div className={styles.inputArea}>
            <div className={styles.inputWrapper}>
                <button
                    aria-label="Прикрепить изображение"
                    className={styles.iconButton}
                    type="button"
                    disabled={isLoading}
                    onClick={handleAttachClick}
                >
                    <svg
                        aria-hidden="true"
                        className={styles.iconSvg}
                        viewBox="0 0 24 24"
                    >
                        <path
                            d="M7.5 12.5l6.7-6.7a3 3 0 114.2 4.2L9.3 19.1a5 5 0 01-7.1-7.1l9.2-9.2"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.8"
                            fill="none"
                        />
                    </svg>
                </button>

                <input
                    accept="image/*"
                    className={styles.fileInput}
                    onChange={handleFileChange}
                    ref={fileInputRef}
                    type="file"
                />

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
                        <button
                            className={[styles.button, styles.ghostButton].join(' ')}
                            onClick={onStop}
                            type="button"
                        >
                            Стоп
                        </button>
                    ) : (
                        <button
                            className={[styles.button, styles.primaryButton].join(' ')}
                            disabled={isSendDisabled}
                            onClick={handleSendClick}
                            type="button"
                        >
                            Отправить
                        </button>
                    )}
                </div>
            </div>
            {imageUrl ? (
                <div className={styles.previewRow}>
                    <img
                        alt={imageName || 'Выбранное изображение'}
                        className={styles.previewImage}
                        src={imageUrl}
                    />
                    <button
                        className={[styles.button, styles.ghostButton].join(' ')}
                        onClick={handleRemoveImage}
                        type="button"
                    >
                        Удалить
                    </button>
                </div>
            ) : null}
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
                <button
                    className={[styles.button, styles.ghostButton].join(' ')}
                    onClick={onRetry}
                    type="button"
                >
                    Повторить
                </button>
            ) : null}
        </div>
    );
}

function MessageListFallback() {
    return <div className={styles.messageFallback}>Загрузка сообщений...</div>;
}
