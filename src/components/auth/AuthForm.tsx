import { useState, type FormEvent } from 'react';
import { scopeOptions } from '../../mocks';
import type { ScopeOption } from '../../types';
import { Button } from '../ui/Button';
import { ErrorMessage } from '../ui/ErrorMessage';
import styles from './AuthForm.module.css';

interface AuthFormProps {
    onSubmit: (credentials: string, scope: ScopeOption) => void;
}

export function AuthForm({ onSubmit }: AuthFormProps) {
    const [credentials, setCredentials] = useState('');
    const [scope, setScope] = useState<ScopeOption>('GIGACHAT_API_PERS');
    const [error, setError] = useState('');

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!credentials.trim()) {
            setError('Введите credentials в формате Base64.');
            return;
        }

        setError('');
        onSubmit(credentials, scope);
    };

    return (
        <div className={styles.page}>
            <form className={styles.card} onSubmit={handleSubmit}>
                <div>
                    <p className={styles.eyebrow}>Авторизация</p>
                    <h1 className={styles.title}>Подключение к GigaChat</h1>
                    <p className={styles.description}>
                        Это моковый экран. Валидация только клиентская, без реального запроса.
                    </p>
                </div>

                <label className={styles.field}>
                    <span>Credentials</span>
                    <input
                        className={styles.input}
                        onChange={(event) => setCredentials(event.target.value)}
                        placeholder="Введите Base64-строку"
                        type="password"
                        value={credentials}
                    />
                </label>

                <fieldset className={styles.scopeList}>
                    <legend>Scope</legend>
                    {scopeOptions.map((option) => (
                        <label className={styles.scopeItem} key={option}>
                            <input
                                checked={scope === option}
                                name="scope"
                                onChange={() => setScope(option)}
                                type="radio"
                            />
                            <span>{option}</span>
                        </label>
                    ))}
                </fieldset>

                {error ? <ErrorMessage message={error} /> : null}

                <Button type="submit" variant="primary">
                    Войти
                </Button>
            </form>
        </div>
    );
}