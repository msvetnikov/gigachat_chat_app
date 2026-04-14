/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_GIGACHAT_API_URL?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}