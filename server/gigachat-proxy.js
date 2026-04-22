import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';
import { Readable } from 'node:stream';
import { URL } from 'node:url';
import { config } from 'dotenv';

config();

const PORT = Number(process.env.GIGACHAT_PROXY_PORT ?? 8787);
const AUTH_KEY = process.env.GIGACHAT_AUTH_KEY ?? '';
const SCOPE = process.env.GIGACHAT_SCOPE ?? 'GIGACHAT_API_PERS';
const OAUTH_URL = process.env.GIGACHAT_OAUTH_URL ?? 'https://ngw.devices.sberbank.ru:9443/api/v2/oauth';
const API_URL = process.env.GIGACHAT_API_URL ?? 'https://gigachat.devices.sberbank.ru/api/v1';

const tokenCache = {
    token: '',
    expiresAt: 0,
};

const withCors = (res, origin) => {
    res.setHeader('Access-Control-Allow-Origin', origin ?? '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
};

const readRequestBody = (req) =>
    new Promise((resolve, reject) => {
        let data = '';
        req.on('data', (chunk) => {
            data += chunk;
        });
        req.on('end', () => resolve(data));
        req.on('error', reject);
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

const server = createServer(async (req, res) => {
    const origin = req.headers.origin;
    withCors(res, origin);

    if (req.method === 'OPTIONS') {
        res.statusCode = 204;
        res.end();
        return;
    }

    const url = new URL(req.url ?? '/', `http://${req.headers.host}`);

    const isChatCompletions = url.pathname === '/api/chat/completions';
    const isModels = url.pathname === '/api/models';

    if (!((req.method === 'POST' && isChatCompletions) || (req.method === 'GET' && isModels))) {
        res.statusCode = 404;
        res.end('Not found');
        return;
    }

    try {
        const rawBody = req.method === 'POST' ? await readRequestBody(req) : '';
        const payload = rawBody ? JSON.parse(rawBody) : {};
        const token = await fetchAccessToken();

        const upstream = await fetch(
            isModels ? `${API_URL}/models` : `${API_URL}/chat/completions`,
            {
                method: isModels ? 'GET' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: isModels ? undefined : JSON.stringify(payload),
            }
        );

        if (!upstream.ok) {
            res.statusCode = upstream.status;
            const errorBody = await upstream.text();
            console.error('Upstream error', upstream.status, errorBody);
            res.setHeader('Content-Type', 'application/json');
            res.end(errorBody);
            return;
        }

        const isStream = !isModels && Boolean(payload?.stream);
        if (isStream && upstream.body) {
            res.statusCode = upstream.status;
            res.setHeader('Content-Type', upstream.headers.get('content-type') ?? 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');
            Readable.fromWeb(upstream.body).pipe(res);
            return;
        }

        const responseBody = await upstream.text();
        res.statusCode = upstream.status;
        res.setHeader('Content-Type', upstream.headers.get('content-type') ?? 'application/json');
        res.end(responseBody);
    } catch (error) {
        console.error('Proxy error', error);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }));
    }
});

server.listen(PORT, () => {
    console.log(`GigaChat proxy running at http://localhost:${PORT}`);
});
