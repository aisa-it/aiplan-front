[![License: MPL 2.0](https://img.shields.io/badge/License-MPL_2.0-brightgreen.svg)](https://opensource.org/licenses/MPL-2.0)
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
