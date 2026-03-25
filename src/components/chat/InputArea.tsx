import { useLayoutEffect, useRef, useState, type KeyboardEventHandler } from 'react';
import { Button } from '../ui/Button';
import styles from './InputArea.module.css';

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
        <div className={styles.wrapper}>
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
                <Button disabled={!text.trim() || isLoading} onClick={handleSendClick} variant="primary">
                    Отправить
                </Button>
                <Button onClick={onStop} variant="ghost">
                    Стоп
                </Button>
            </div>
        </div>
    );
}