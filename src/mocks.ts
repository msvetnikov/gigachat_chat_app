import type { ChatData, ScopeOption, SettingsValues } from './types';

export const scopeOptions: ScopeOption[] = [
    'GIGACHAT_API_PERS',
    'GIGACHAT_API_B2B',
    'GIGACHAT_API_CORP',
];

export const defaultSettings: SettingsValues = {
    model: 'GigaChat-Plus',
    temperature: 0.8,
    topP: 0.85,
    maxTokens: 2048,
    systemPrompt:
        'Ты полезный ассистент. Отвечай структурированно, кратко и с примерами, если это уместно.',
};

export const mockChats: ChatData[] = [
    {
        id: 'chat-1',
        title: 'Подготовка презентации для команды продукта',
        lastMessageDate: '12 мар',
        preview: 'Собрал тезисы по запуску и рискам внедрения.',
        messages: [
            {
                id: 'm-1',
                author: 'Вы',
                variant: 'user',
                timestamp: '10:05',
                content:
                    'Помоги подготовить **структуру презентации** для запуска нового AI-чата в корпоративном продукте.',
            },
            {
                id: 'm-2',
                author: 'GigaChat',
                variant: 'assistant',
                timestamp: '10:05',
                content:
                    'Конечно. Предлагаю такой план:\n\n- Проблема пользователя\n- Ценность решения\n- Архитектура интеграции\n- Метрики успеха\n- Риски и план запуска',
            },
            {
                id: 'm-3',
                author: 'Вы',
                variant: 'user',
                timestamp: '10:06',
                content:
                    'Добавь блок про **ожидаемый эффект для бизнеса** и короткий список KPI.',
            },
            {
                id: 'm-4',
                author: 'GigaChat',
                variant: 'assistant',
                timestamp: '10:06',
                content:
                    'Подойдёт такой блок:\n\n1. Рост конверсии в self-service\n2. Снижение нагрузки на поддержку\n3. Ускорение онбординга новых клиентов',
            },
            {
                id: 'm-5',
                author: 'Вы',
                variant: 'user',
                timestamp: '10:07',
                content:
                    'Покажи пример слайда с кодовым блоком для демонстрации prompt-шаблона.',
            },
            {
                id: 'm-6',
                author: 'GigaChat',
                variant: 'assistant',
                timestamp: '10:07',
                content:
                    'Можно оформить так:\n\n```txt\nРоль: AI-ассистент продукта\nЗадача: ответить на вопрос пользователя\nФормат: коротко, с шагами и примерами\n```',
            },
        ],
    },
    {
        id: 'chat-2',
        title: 'Идеи для лендинга курса по React',
        lastMessageDate: '11 мар',
        preview: 'Нужны оффер, FAQ и блок с отзывами.',
        messages: [],
    },
    {
        id: 'chat-3',
        title: 'Черновик FAQ для службы поддержки',
        lastMessageDate: '10 мар',
        preview: 'Собрали 12 частых вопросов клиентов.',
        messages: [],
    },
    {
        id: 'chat-4',
        title: 'Сценарии онбординга в мобильном приложении',
        lastMessageDate: '09 мар',
        preview: 'Нужно упростить первый запуск и регистрацию.',
        messages: [],
    },
    {
        id: 'chat-5',
        title: 'Исследование конкурентов по AI-ассистентам',
        lastMessageDate: '07 мар',
        preview: 'Сравнение по моделям, UX и цене.',
        messages: [],
    },
];