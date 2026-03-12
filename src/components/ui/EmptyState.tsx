import styles from './EmptyState.module.css';

export function EmptyState() {
    return (
        <div className={styles.state}>
            <div className={styles.icon}>✦</div>
            <h3>Начните новый диалог</h3>
            <p>Выберите чат слева или создайте новый, чтобы увидеть сообщения здесь.</p>
        </div>
    );
}