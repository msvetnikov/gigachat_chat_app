import { randomUUID } from 'node:crypto';

const AUTH_KEY = process.env.GIGACHAT_AUTH_KEY ?? '';
const SCOPE = process.env.GIGACHAT_SCOPE ?? 'GIGACHAT_API_PERS';
const OAUTH_URL = process.env.GIGACHAT_OAUTH_URL ?? 'https://ngw.devices.sberbank.ru:9443/api/v2/oauth';
const API_URL = process.env.GIGACHAT_API_URL ?? 'https://gigachat.devices.sberbank.ru/api/v1';

const tokenCache = {
    token: '',
    expiresAt: 0,
};

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
            RqUID: randomUUID(),
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

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    try {
        const token = await fetchAccessToken();
        const upstream = await fetch(`${API_URL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(req.body ?? {}),
        });

        if (!upstream.ok) {
            const errorBody = await upstream.text();
            res.status(upstream.status).send(errorBody);
            return;
        }

        const responseBody = await upstream.text();
        const contentType = upstream.headers.get('content-type');
        if (contentType) {
            res.setHeader('Content-Type', contentType);
        }
        res.status(upstream.status).send(responseBody);
    } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
}
