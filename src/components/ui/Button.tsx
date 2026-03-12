import type { ReactNode } from 'react';
import styles from './Button.module.css';

interface ButtonProps {
    children: ReactNode;
    disabled?: boolean;
    icon?: string;
    onClick?: () => void;
    type?: 'button' | 'submit';
    variant?: 'primary' | 'ghost';
}

export function Button({
    children,
    disabled = false,
    icon,
    onClick,
    type = 'button',
    variant = 'primary',
}: ButtonProps) {
    return (
        <button
            className={[styles.button, styles[variant]].join(' ')}
            disabled={disabled}
            onClick={onClick}
            type={type}
        >
            {icon ? <span className={styles.icon}>{icon}</span> : null}
            <span>{children}</span>
        </button>
    );
}