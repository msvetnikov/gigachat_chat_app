const AUTH_KEY = process.env.GIGACHAT_AUTH_KEY ?? '';
const SCOPE = process.env.GIGACHAT_SCOPE ?? 'GIGACHAT_API_PERS';
const OAUTH_URL = process.env.GIGACHAT_OAUTH_URL ?? 'https://ngw.devices.sberbank.ru:9443/api/v2/oauth';
const API_URL = process.env.GIGACHAT_API_URL ?? 'https://gigachat.devices.sberbank.ru/api/v1';

// Кэш токена (твоя отличная идея, оставляем)
const tokenCache = {
    token: '',
    expiresAt: 0,
};

const fetchAccessToken = async () => {
    const now = Date.now();
    if (tokenCache.token && tokenCache.expiresAt > now) return tokenCache.token;

    const response = await fetch(OAUTH_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Accept: 'application/json',
            Authorization: `Basic ${AUTH_KEY}`,
            RqUID: crypto.randomUUID(),
        },
        body: new URLSearchParams({ scope: SCOPE }),
    });

    if (!response.ok) throw new Error(`OAuth error: ${response.status}`);

    const data = await response.json();
    tokenCache.token = data.access_token;
    tokenCache.expiresAt = Date.now() + (data.expires_in * 1000 - 60000);
    return tokenCache.token;
};

export const handler = async (event) => {
    // CORS (нужен для локальной отладки и соответствия стандартам)
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
    };

    if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: corsHeaders, body: '' };
    if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

    try {
        const payload = JSON.parse(event.body);
        const token = await fetchAccessToken();

        // Делаем запрос к GigaChat
        const upstream = await fetch(`${API_URL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                // Если фронтенд просит стрим, просим его и у GigaChat
                'Accept': payload.stream ? 'text/event-stream' : 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!upstream.ok) {
            const errText = await upstream.text();
            return { statusCode: upstream.status, headers: corsHeaders, body: errText };
        }

        // --- ЛОГИКА СТРИМИНГА ДЛЯ ТЗ ---
        if (payload.stream) {
            return {
                statusCode: 200,
                headers: {
                    ...corsHeaders,
                    'Content-Type': 'text/event-stream',
                    'Cache-Control': 'no-cache',
                    'Connection': 'keep-alive',
                },
                // Пробрасываем поток данных напрямую ("Pipe")
                body: upstream.body, 
            };
        }

        // Логика для обычного JSON (если stream: false)
        const responseData = await upstream.text();
        return {
            statusCode: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            body: responseData,
        };

    } catch (error) {
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({ error: error.message }),
        };
    }
};