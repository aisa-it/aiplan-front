[![License: MPL 2.0](https://img.shields.io/badge/License-MPL_2.0-brightgreen.svg)](https://opensource.org/licenses/MPL-2.0)
[![en](https://img.shields.io/badge/README-en-green.svg)](https://github.com/aisa-it/aiplan-front/blob/main/README.md)
[![ru](https://img.shields.io/badge/README-ru-green.svg)](https://github.com/aisa-it/aiplan-front/blob/main/README.ru.md)
# AIPlan

Клиентская часть приложения AIPlan

Работать только со сборщиком yarn!

## Запуск

Установка зависимостей

```bash
yarn install
```

Запуск линтера

```bash
yarn lint
```

Запуск в режиме разработки

```bash
yarn dev
```

Cборка приложения

```bash
yarn build
```

Перед запуском необходимо установить переменные окружения, пример есть в example.env

```bash
// Адрес для api
VITE_API_URL="https://domain.com"

// Адрес для minio
VITE_MINIO_URL="https://domain.com"
```

## Запуск в SPA режиме

По умолчанию проект запускается в режиме PWA, при необходимости его можно отключить, изменив скрипты запуска.

Запуск в режиме разработки

```bash
quasar dev
```

Сборка приложения

```bash
quasar build
```
