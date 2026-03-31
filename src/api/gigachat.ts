export type ChatCompletionRole = 'system' | 'user' | 'assistant';

export interface ChatCompletionMessage {
    role: ChatCompletionRole;
    content: string;
}

export interface ChatCompletionPayload {
    model: string;
    messages: ChatCompletionMessage[];
    temperature?: number;
    top_p?: number;
    max_tokens?: number;
    stream?: boolean;
}

const extractContent = (data: any): string => {
    const choice = data?.choices?.[0];
    return (
        choice?.delta?.content ||
        choice?.message?.content ||
        data?.content ||
        ''
    );
};

export const createChatCompletion = async (
    payload: ChatCompletionPayload,
    signal?: AbortSignal
): Promise<string> => {
    const response = await fetch('/api/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal,
    });

    if (!response.ok) {
        throw new Error(`GigaChat API error: ${response.status}`);
    }

    const data = await response.json();
    return extractContent(data);
};

export const streamChatCompletion = async (
    payload: ChatCompletionPayload,
    onDelta: (chunk: string) => void,
    signal?: AbortSignal
) => {
    const response = await fetch('/api/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...payload, stream: true }),
        signal,
    });

    if (!response.ok || !response.body) {
        throw new Error(`GigaChat API error: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
        const { done, value } = await reader.read();
        if (done) {
            break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith('data:')) {
                continue;
            }

            const data = trimmed.replace('data:', '').trim();
            if (!data || data === '[DONE]') {
                continue;
            }

            try {
                const parsed = JSON.parse(data);
                const content = extractContent(parsed);
                if (content) {
                    onDelta(content);
                }
            } catch {
                // Ignore malformed streaming chunks.
            }
        }
    }
};
