import { useLayoutEffect, useRef, type KeyboardEventHandler } from 'react';
import { Button } from '../ui/Button';
import styles from './InputArea.module.css';

interface InputAreaProps {
    value: string;
    onChange: (value: string) => void;
    onSend: () => void;
    onStop: () => void;
}

export function InputArea({ value, onChange, onSend, onStop }: InputAreaProps) {
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
    }, [value]);

    const handleKeyDown: KeyboardEventHandler<HTMLTextAreaElement> = (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();

            if (value.trim()) {
                onSend();
            }
        }
    };

    return (
        <div className={styles.wrapper}>
            <button aria-label="Прикрепить изображение" className={styles.iconButton} type="button">
                🖼
            </button>

            <textarea
                className={styles.textarea}
                onChange={(event) => onChange(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Введите сообщение..."
                ref={textareaRef}
                rows={1}
                value={value}
            />

            <div className={styles.actions}>
                <Button disabled={!value.trim()} onClick={onSend} variant="primary">
                    Отправить
                </Button>
                <Button onClick={onStop} variant="ghost">
                    Стоп
                </Button>
            </div>
        </div>
    );
}