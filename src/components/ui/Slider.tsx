import styles from './Slider.module.css';

interface SliderProps {
    label: string;
    max: number;
    min: number;
    onChange: (value: number) => void;
    step: number;
    value: number;
}

export function Slider({ label, max, min, onChange, step, value }: SliderProps) {
    return (
        <label className={styles.wrapper}>
            <span className={styles.labelRow}>
                <span>{label}</span>
                <strong>{value}</strong>
            </span>
            <input
                className={styles.input}
                max={max}
                min={min}
                onChange={(event) => onChange(Number(event.target.value))}
                step={step}
                type="range"
                value={value}
            />
        </label>
    );
}