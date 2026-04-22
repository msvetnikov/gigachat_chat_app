import { useEffect, useState } from 'react';
import { fetchModels } from '../api/gigachat';
import { useChatSettings } from '../hooks/useChatSettings';
import type { SettingsValues } from '../types';
import styles from './SettingsPanel.module.css';

interface SettingsPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
    const { settings, updateSettings } = useChatSettings();
    const [models, setModels] = useState<string[]>([
        'GigaChat',
        'GigaChat-Plus',
        'GigaChat-Pro',
        'GigaChat-Max',
    ]);
    const [loadError, setLoadError] = useState('');

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const controller = new AbortController();
        fetchModels(controller.signal)
            .then((result) => {
                if (result.length) {
                    setModels(result);
                }
                setLoadError('');
            })
            .catch(() => {
                setLoadError('Не удалось загрузить список моделей.');
            });

        return () => controller.abort();
    }, [isOpen]);

    if (!isOpen) {
        return null;
    }

    return (
        <div className={styles.overlay} role="presentation">
            <div className={styles.backdrop} onClick={onClose} />
            <div className={styles.panel} role="dialog" aria-modal="true">
                <div>
                    <h3 className={styles.title}>Настройки</h3>
                    <p className={styles.text}>Параметры запроса к модели.</p>
                </div>

                <label className={styles.field}>
                    <span>Модель</span>
                    <select
                        className={styles.input}
                        onChange={(event) =>
                            updateSettings({ model: event.target.value as SettingsValues['model'] })
                        }
                        value={settings.model}
                    >
                        {models.map((model) => (
                            <option key={model} value={model}>
                                {model}
                            </option>
                        ))}
                    </select>
                    {loadError ? <span className={styles.helper}>{loadError}</span> : null}
                </label>

                <label className={styles.field}>
                    <span>System Prompt</span>
                    <textarea
                        className={styles.textarea}
                        onChange={(event) => updateSettings({ systemPrompt: event.target.value })}
                        rows={4}
                        value={settings.systemPrompt}
                    />
                </label>

                <label className={styles.field}>
                    <span>Temperature: {settings.temperature.toFixed(2)}</span>
                    <input
                        className={styles.range}
                        max={2}
                        min={0}
                        onChange={(event) =>
                            updateSettings({ temperature: Number(event.target.value) })
                        }
                        step={0.05}
                        type="range"
                        value={settings.temperature}
                    />
                </label>

                <label className={styles.field}>
                    <span>Top P: {settings.topP.toFixed(2)}</span>
                    <input
                        className={styles.range}
                        max={1}
                        min={0}
                        onChange={(event) => updateSettings({ topP: Number(event.target.value) })}
                        step={0.05}
                        type="range"
                        value={settings.topP}
                    />
                </label>

                <label className={styles.field}>
                    <span>Max Tokens</span>
                    <input
                        className={styles.input}
                        min={1}
                        onChange={(event) =>
                            updateSettings({ maxTokens: Number(event.target.value) })
                        }
                        type="number"
                        value={settings.maxTokens}
                    />
                </label>

                <label className={styles.field}>
                    <span>Repetition Penalty: {settings.repetitionPenalty.toFixed(2)}</span>
                    <input
                        className={styles.range}
                        max={2}
                        min={0.1}
                        onChange={(event) =>
                            updateSettings({ repetitionPenalty: Number(event.target.value) })
                        }
                        step={0.05}
                        type="range"
                        value={settings.repetitionPenalty}
                    />
                </label>

                <div className={styles.actions}>
                    <button className={styles.button} onClick={onClose} type="button">
                        Закрыть
                    </button>
                </div>
            </div>
        </div>
    );
}
