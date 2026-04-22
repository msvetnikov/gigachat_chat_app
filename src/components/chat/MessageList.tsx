import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypePrism from 'rehype-prism-plus';
import type { Message as MessageType, MessageContentPart, MessageVariant } from '../../types';
import styles from './MessageList.module.css';

interface MessageListProps {
    isTypingVisible: boolean;
    messages: MessageType[];
}

export function MessageList({ isTypingVisible, messages }: MessageListProps) {
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTypingVisible]);

    return (
        <div className={styles.list}>
            {messages
                .filter((message) => message.role !== 'system')
                .map((message) => {
                    const variant = message.role === 'assistant' ? 'assistant' : 'user';
                    return (
                        <Message
                            key={message.id}
                            message={message}
                            variant={variant}
                        />
                    );
                })}
            <TypingIndicator isVisible={isTypingVisible} />
            <div ref={bottomRef} />
        </div>
    );
}

interface MessageProps {
    message: MessageType;
    variant: MessageVariant;
}

export function Message({ message, variant }: MessageProps) {
    const [copied, setCopied] = useState(false);
    const timeoutRef = useRef<number | null>(null);
    const contentParts: MessageContentPart[] = Array.isArray(message.content)
        ? message.content
        : [{ type: 'text', text: message.content }];
    const textContent = contentParts
        .filter((part): part is { type: 'text'; text: string } => part.type === 'text')
        .map((part) => part.text)
        .join(' ');
    const imageParts = contentParts.filter(
        (part): part is { type: 'image_url'; image_url: { url: string } } =>
            part.type === 'image_url'
    );

    useEffect(() => () => {
        if (timeoutRef.current) {
            window.clearTimeout(timeoutRef.current);
        }
    }, []);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(textContent);
            setCopied(true);
            if (timeoutRef.current) {
                window.clearTimeout(timeoutRef.current);
            }
            timeoutRef.current = window.setTimeout(() => setCopied(false), 2000);
        } catch {
            setCopied(false);
        }
    };

    return (
        <article
            className={[
                styles.message,
                variant === 'user' ? styles.user : styles.assistant,
            ].join(' ')}
        >
            {variant === 'assistant' ? <div className={styles.avatar}>G</div> : null}

            <div className={styles.bubble}>
                <div className={styles.metaRow}>
                    <strong>{variant === 'user' ? 'Вы' : 'GigaChat'}</strong>
                    <span>{message.timestamp}</span>
                </div>
                {textContent ? (
                    <div className={styles.markdown}>
                        <ReactMarkdown rehypePlugins={[rehypePrism]}>
                            {textContent}
                        </ReactMarkdown>
                    </div>
                ) : null}
                {imageParts.length ? (
                    <div className={styles.imageRow}>
                        {imageParts.map((part, index) => (
                            <img
                                alt="Вложение"
                                className={styles.image}
                                key={`${message.id}-img-${index}`}
                                src={part.image_url.url}
                            />
                        ))}
                    </div>
                ) : null}
            </div>

            {variant === 'assistant' ? (
                <button className={styles.copyButton} onClick={handleCopy} type="button">
                    {copied ? 'Скопировано' : 'Копировать'}
                </button>
            ) : null}
        </article>
    );
}

interface TypingIndicatorProps {
    isVisible?: boolean;
}

function TypingIndicator({ isVisible = true }: TypingIndicatorProps) {
    if (!isVisible) {
        return null;
    }

    return (
        <div className={styles.typingWrapper}>
            <div className={styles.typingAvatar}>G</div>
            <div className={styles.typingBubble}>
                <span />
                <span />
                <span />
            </div>
        </div>
    );
}