import React from 'react';
import ReactDOM from 'react-dom/client';
import { ChatProvider } from './app/providers/ChatProvider';
import { AppRoutes } from './app/router/routes';
import 'prismjs/themes/prism.css';
import './app/theme.css';

const DEFAULT_SETTINGS = {
    model: 'GigaChat',
    systemPrompt: 'Ты полезный ассистент. Отвечай структурированно и кратко.',
    temperature: 0.7,
    topP: 0.9,
    maxTokens: 2048,
    repetitionPenalty: 1,
};

const ENABLE_STREAMING = import.meta.env.VITE_GIGACHAT_STREAMING !== 'false';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <ChatProvider
            model={DEFAULT_SETTINGS.model}
            systemPrompt={DEFAULT_SETTINGS.systemPrompt}
            temperature={DEFAULT_SETTINGS.temperature}
            topP={DEFAULT_SETTINGS.topP}
            maxTokens={DEFAULT_SETTINGS.maxTokens}
            repetitionPenalty={DEFAULT_SETTINGS.repetitionPenalty}
            enableStreaming={ENABLE_STREAMING}
        >
            <AppRoutes />
        </ChatProvider>
    </React.StrictMode>
);