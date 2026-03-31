@echo off
setlocal

REM Local-only workaround for TLS issues. Replace the path below.
set NODE_EXTRA_CA_CERTS=C:\path\to\certs.pem
set NODE_TLS_REJECT_UNAUTHORIZED=0

start "GigaChat API" cmd /c npm run dev:api
npm run dev
