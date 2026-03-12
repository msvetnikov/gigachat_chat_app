import styles from './SearchInput.module.css';

interface SearchInputProps {
    value: string;
    onChange: (value: string) => void;
}

export function SearchInput({ value, onChange }: SearchInputProps) {
    return (
        <label className={styles.wrapper}>
            <span className={styles.icon}>⌕</span>
            <input
                className={styles.input}
                onChange={(event) => onChange(event.target.value)}
                placeholder="Поиск по чатам"
                type="search"
                value={value}
            />
        </label>
    );
}