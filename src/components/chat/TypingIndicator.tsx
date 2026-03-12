import styles from './TypingIndicator.module.css';

interface TypingIndicatorProps {
    isVisible?: boolean;
}

export function TypingIndicator({ isVisible = true }: TypingIndicatorProps) {
    if (!isVisible) {
        return null;
    }

    return (
        <div className={styles.wrapper}>
            <div className={styles.avatar}>G</div>
            <div className={styles.bubble}>
                <span />
                <span />
                <span />
            </div>
        </div>
    );
}