import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import type { MessageData, MessageVariant } from '../../types';
import styles from './Message.module.css';

interface MessageProps {
    message: MessageData;
    variant: MessageVariant;
}

export function Message({ message, variant }: MessageProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(message.content);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1500);
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
                <div className={styles.markdown}>
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                </div>
            </div>

            <button className={styles.copyButton} onClick={handleCopy} type="button">
                {copied ? 'Скопировано' : 'Копировать'}
            </button>
        </article>
    );
}