import { useEffect, useState } from 'react';
import type { ModelOption, SettingsValues, ThemeMode } from '../../types';
import { Button } from '../ui/Button';
import { Slider } from '../ui/Slider';
import { Toggle } from '../ui/Toggle';
import styles from './SettingsPanel.module.css';

interface SettingsPanelProps {
    isOpen: boolean;
    settings: SettingsValues;
    theme: ThemeMode;
    onClose: () => void;
    onReset: () => void;
    onSave: (settings: SettingsValues) => void;
    onToggleTheme: () => void;
}

export function SettingsPanel({
    isOpen,
    settings,
    theme,
    onClose,
    onReset,
    onSave,
    onToggleTheme,
}: SettingsPanelProps) {
    const [draftSettings, setDraftSettings] = useState(settings);

    useEffect(() => {
        setDraftSettings(settings);
    }, [settings, isOpen]);

    return (
        <div className={[styles.overlay, isOpen ? styles.open : ''].join(' ')}>
            <div aria-hidden className={styles.backdrop} onClick={onClose} />
            <aside className={styles.panel}>
                <header className={styles.header}>
                    <div>
                        <p className={styles.eyebrow}>Настройки</p>
                        <h3 className={styles.title}>Параметры модели</h3>
                    </div>
                    <button aria-label="Закрыть настройки" className={styles.closeButton} onClick={onClose} type="button">
                        ✕
                    </button>
                </header>

                <div className={styles.body}>
                    <label className={styles.field}>
                        <span>Модель</span>
                        <select
                            className={styles.select}
                            onChange={(event) =>
                                setDraftSettings((current) => ({
                                    ...current,
                                    model: event.target.value as ModelOption,
                                }))
                            }
                            value={draftSettings.model}
                        >
                            <option value="GigaChat">GigaChat</option>
                            <option value="GigaChat-Plus">GigaChat-Plus</option>
                            <option value="GigaChat-Pro">GigaChat-Pro</option>
                            <option value="GigaChat-Max">GigaChat-Max</option>
                        </select>
                    </label>

                    <Slider
                        label="Temperature"
                        max={2}
                        min={0}
                        onChange={(value) =>
                            setDraftSettings((current) => ({ ...current, temperature: value }))
                        }
                        step={0.1}
                        value={draftSettings.temperature}
                    />

                    <Slider
                        label="Top-P"
                        max={1}
                        min={0}
                        onChange={(value) =>
                            setDraftSettings((current) => ({ ...current, topP: value }))
                        }
                        step={0.05}
                        value={draftSettings.topP}
                    />

                    <label className={styles.field}>
                        <span>Max Tokens</span>
                        <input
                            className={styles.input}
                            min={1}
                            onChange={(event) =>
                                setDraftSettings((current) => ({
                                    ...current,
                                    maxTokens: Number(event.target.value),
                                }))
                            }
                            type="number"
                            value={draftSettings.maxTokens}
                        />
                    </label>

                    <label className={styles.field}>
                        <span>System Prompt</span>
                        <textarea
                            className={styles.textarea}
                            onChange={(event) =>
                                setDraftSettings((current) => ({
                                    ...current,
                                    systemPrompt: event.target.value,
                                }))
                            }
                            rows={6}
                            value={draftSettings.systemPrompt}
                        />
                    </label>

                    <div className={styles.toggleRow}>
                        <div>
                            <strong>Тема</strong>
                            <p>{theme === 'light' ? 'Светлая тема' : 'Тёмная тема'}</p>
                        </div>
                        <Toggle
                            checked={theme === 'dark'}
                            label="Переключить тему"
                            onChange={onToggleTheme}
                        />
                    </div>
                </div>

                <footer className={styles.footer}>
                    <Button onClick={() => onSave(draftSettings)} variant="primary">
                        Сохранить
                    </Button>
                    <Button onClick={onReset} variant="ghost">
                        Сбросить
                    </Button>
                </footer>
            </aside>
        </div>
    );
}