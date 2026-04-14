# GigaChat UI Shell

Учебный проект — UI-оболочка чат-приложения на React + TypeScript.

## Демо

- Публичная ссылка: добавить после деплоя.
- Скриншоты/видео: добавить после деплоя.

## Стек

- React 19
- TypeScript 5
- Vite 7
- React Router 6
- Context + `useReducer`
- CSS Modules
- react-markdown + rehype-prism-plus
- Vitest + React Testing Library

## Запуск локально

1. Клонируйте репозиторий.
2. Установите зависимости:

```bash
npm install
```

3. Создайте [.env](.env) в корне проекта по образцу [.env.example](.env.example).
4. Запустите proxy-сервер в одном терминале:

```bash
npm run dev:api
```

5. Запустите Vite во втором терминале:

```bash
npm run dev
```

Откройте URL из вывода Vite (например, http://localhost:5174).

## Env

| Переменная | Назначение | Где используется |
| --- | --- | --- |
| `GIGACHAT_AUTH_KEY` | ключ авторизации GigaChat для получения OAuth-токена | сервер (proxy) |
| `GIGACHAT_SCOPE` | скоуп доступа | сервер (proxy) |
| `GIGACHAT_OAUTH_URL` | URL получения OAuth-токена | сервер (proxy) |
| `GIGACHAT_API_URL` | базовый URL API GigaChat | сервер (proxy) |
| `GIGACHAT_PROXY_PORT` | порт локального proxy-сервера | сервер (локально) |
| `VITE_GIGACHAT_API_URL` | базовый URL для запросов клиента | клиент |

## Тесты

```bash
npm test
```

Покрытие:
- unit-тесты на reducer;
- компонентные тесты для `InputArea`, `Message`, `Sidebar`;
- тесты на персистентность `localStorage`.

## Анализ бандла

```bash
npm run analyze
```

Скриншот визуализатора бандла: [docs/bundle-analysis.png](docs/bundle-analysis.png)

## Сертификаты

Для работы с API требуется, чтобы корневые сертификаты НУЦ Минцифры были установлены. Есть два варианта:

**Правильно (рекомендуется):** установить корневые сертификаты НУЦ Минцифры.
1. Скачайте корневые сертификаты НУЦ Минцифры с официального сайта.
2. Откройте файл сертификата → «Установить сертификат».
3. Выберите «Локальный компьютер» → «Доверенные корневые центры сертификации».

**Быстро локально (менее безопасно):**

Windows:
```
scripts\dev-with-tls.cmd
```

macOS / Linux:
```
NODE_TLS_REJECT_UNAUTHORIZED=0 npm run dev:api
npm run dev
```

## Деплой

- Хостинг: Vercel.
- Переменные окружения задаются в настройках хостинга, ключи не хранятся в коде.
- API работает через serverless-роут [api/chat/completions.js](api/chat/completions.js).
- Для React Router настроен SPA-редирект: [vercel.json](vercel.json).
