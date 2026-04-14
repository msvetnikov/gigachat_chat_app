import styles from './SettingsPanel.module.css';

interface SettingsPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
    if (!isOpen) {
        return null;
    }

    return (
        <div className={styles.overlay} role="presentation">
            <div className={styles.backdrop} onClick={onClose} />
            <div className={styles.panel} role="dialog" aria-modal="true">
                <h3 className={styles.title}>Настройки</h3>
                <p className={styles.text}>
                    Панель настроек загружается лениво и не влияет на стартовую загрузку.
                </p>
                <div className={styles.actions}>
                    <button className={styles.button} onClick={onClose} type="button">
                        Закрыть
                    </button>
                </div>
            </div>
        </div>
    );
}
