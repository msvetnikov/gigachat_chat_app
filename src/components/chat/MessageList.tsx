import type { MessageData } from '../../types';
import { Message } from './Message';
import { TypingIndicator } from './TypingIndicator';
import styles from './MessageList.module.css';

interface MessageListProps {
    isTypingVisible: boolean;
    messages: MessageData[];
}

export function MessageList({ isTypingVisible, messages }: MessageListProps) {
    return (
        <div className={styles.list}>
            {messages.map((message) => (
                <Message key={message.id} message={message} variant={message.variant} />
            ))}
            <TypingIndicator isVisible={isTypingVisible} />
        </div>
    );
}