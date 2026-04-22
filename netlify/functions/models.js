const AUTH_KEY = process.env.GIGACHAT_AUTH_KEY ?? '';
const SCOPE = process.env.GIGACHAT_SCOPE ?? 'GIGACHAT_API_PERS';
const OAUTH_URL = process.env.GIGACHAT_OAUTH_URL ?? 'https://ngw.devices.sberbank.ru:9443/api/v2/oauth';
const API_URL = process.env.GIGACHAT_API_URL ?? 'https://gigachat.devices.sberbank.ru/api/v1';

const tokenCache = {
    token: '',
    expiresAt: 0,
};

const jsonResponse = (statusCode, payload) => ({
    statusCode,
    headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify(payload),
});

const fetchAccessToken = async () => {
    const now = Date.now();
    if (tokenCache.token && tokenCache.expiresAt > now) {
        return tokenCache.token;
    }

    if (!AUTH_KEY) {
        throw new Error('Missing GIGACHAT_AUTH_KEY in environment.');
    }

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

    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`OAuth error: ${response.status} ${errorBody}`);
    }

    const data = await response.json();
    const token = data?.access_token ?? '';
    const expiresIn = Number(data?.expires_in ?? 0);

    if (!token) {
        throw new Error('OAuth response missing access_token.');
    }

    tokenCache.token = token;
    tokenCache.expiresAt = Date.now() + Math.max(expiresIn * 1000 - 60_000, 0);

    return token;
};

export const handler = async (event) => {
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 204,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
            },
            body: '',
        };
    }

    if (event.httpMethod !== 'GET') {
        return jsonResponse(405, { error: 'Method Not Allowed' });
    }

    try {
        const token = await fetchAccessToken();
        const upstream = await fetch(`${API_URL}/models`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });

        const responseText = await upstream.text();
        if (!upstream.ok) {
            return {
                statusCode: upstream.status,
                headers: {
                    'Content-Type': upstream.headers.get('content-type') ?? 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
                body: responseText,
            };
        }

        return {
            statusCode: upstream.status,
            headers: {
                'Content-Type': upstream.headers.get('content-type') ?? 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            body: responseText,
        };
    } catch (error) {
        return jsonResponse(500, { error: error instanceof Error ? error.message : 'Unknown error' });
    }
};
