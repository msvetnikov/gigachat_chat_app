# GigaChat UI Shell

Учебный проект — UI-оболочка чат-приложения на React + TypeScript.

## Демо

- Публичная ссылка: https://gigachat-app-chat.netlify.app/
- Видеодемонстрация:

https://github.com/user-attachments/assets/fc41b60f-93d0-499f-a68a-324978c901e2


## Стек

- React 19
- TypeScript 5
- Vite 7
- React Router 6
- Context + useReducer
- CSS Modules
- react-markdown + rehype-prism-plus
- Vitest + React Testing Library

## Запуск локально

#### 1. Клонируйте репозиторий:

```bash
git clone https://github.com/msvetnikov/gigachat_chat_app
```

#### 2. Перейдите в папку проекта:

```bash
cd gigachat_chat_app
```

#### 3. Установите зависимости:

```bash
npm install
```

#### 4. Создайте .env в корне проекта по образцу .env.example и заполните значения.
#### 5. Запустите proxy-сервер в одном терминале:

```bash
npm run dev:api
```

#### 6. Запустите Vite во втором терминале:

```bash
npm run dev
```

Откройте URL из вывода Vite (например, http://localhost:5174).

Для работы с API нужны корневые сертификаты НУЦ Минцифры. Если они не установлены, запускайте через скрипт (менее безопасно):

Windows:

```bash
scripts\dev-with-tls.cmd
```

macOS / Linux:

```bash
NODE_TLS_REJECT_UNAUTHORIZED=0 npm run dev:api
npm run dev
```

## Переменные окружения

| Переменная | Назначение | Где используется |
| --- | --- | --- |
| GIGACHAT_AUTH_KEY | ключ авторизации GigaChat для получения OAuth-токена | сервер (proxy) |
| GIGACHAT_SCOPE | скоуп доступа | сервер (proxy) |
| GIGACHAT_OAUTH_URL | URL получения OAuth-токена | сервер (proxy) |
| GIGACHAT_API_URL | базовый URL API GigaChat | сервер (proxy) |
| GIGACHAT_PROXY_PORT | порт локального proxy-сервера | сервер (локально) |
| VITE_GIGACHAT_API_URL | базовый URL для запросов клиента | клиент |
| VITE_GIGACHAT_STREAMING | включает streaming-режим (true/false) | клиент |