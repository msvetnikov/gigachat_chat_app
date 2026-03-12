import styles from './ErrorMessage.module.css';

interface ErrorMessageProps {
    message: string;
}

export function ErrorMessage({ message }: ErrorMessageProps) {
    return (
        <div className={styles.error} role="alert">
            <span>⚠</span>
            <span>{message}</span>
        </div>
    );
}