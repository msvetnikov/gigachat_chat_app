import styles from './Toggle.module.css';

interface ToggleProps {
    checked: boolean;
    label: string;
    onChange: () => void;
}

export function Toggle({ checked, label, onChange }: ToggleProps) {
    return (
        <button
            aria-checked={checked}
            aria-label={label}
            className={[styles.toggle, checked ? styles.checked : ''].join(' ')}
            onClick={onChange}
            role="switch"
            type="button"
        >
            <span className={styles.thumb} />
        </button>
    );
}