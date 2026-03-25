import { useEffect, useRef } from 'react';
import type { MessageData } from '../../types';
import { Message } from './Message';
import { TypingIndicator } from './TypingIndicator';
import styles from './MessageList.module.css';

interface MessageListProps {
    isTypingVisible: boolean;
    messages: MessageData[];
}

export function MessageList({ isTypingVisible, messages }: MessageListProps) {
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTypingVisible]);

    return (
        <div className={styles.list}>
            {messages.map((message) => (
                <Message key={message.id} message={message} variant={message.role} />
            ))}
            <TypingIndicator isVisible={isTypingVisible} />
            <div ref={bottomRef} />
        </div>
    );
}