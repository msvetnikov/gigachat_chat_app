# GigaChat UI Shell

Учебный проект — статичная UI-оболочка чат-приложения на React + TypeScript 

**Стек:** React 19 · TypeScript 5 · Vite 7 · CSS Modules · react-markdown

## Быстрый запуск

```bash
npm install
```

## Переменные окружения

Создайте папку `.env` в корне проекта и добавьте туда:

```bash
GIGACHAT_AUTH_KEY=ваш_authorization_key
GIGACHAT_SCOPE=GIGACHAT_API_PERS
GIGACHAT_OAUTH_URL=https://ngw.devices.sberbank.ru:9443/api/v2/oauth
GIGACHAT_API_URL=https://gigachat.devices.sberbank.ru/api/v1
GIGACHAT_PROXY_PORT=8787
```

## Запуск

1. Установите зависимости:

```bash
npm install
```

Устанавливаются все npm-зависимости для клиента и proxy-сервера.

2. Запустите proxy-сервер в одном терминале:

```bash
npm run dev:api
```

- поднимается локальный proxy, который получает OAuth-токен по `GIGACHAT_AUTH_KEY` и кэширует его;
- прокси прокидывает запросы к GigaChat API, скрывая ключ и обходя проблемы TLS на стороне браузера;
- клиент обращается только к локальному proxy, а не к внешнему API напрямую.

3. Запустите Vite во втором терминале:

```bash
npm run dev
```
- стартует дев-сервер Vite для React-приложения.


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

## Тесты

```bash
npm test
```

Покрытие:
- unit-тесты на reducer;
- компонентные тесты для `InputArea`, `Message`, `Sidebar`;
- тесты на персистентность `localStorage`.
