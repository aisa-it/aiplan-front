[![License: MPL 2.0](https://img.shields.io/badge/License-MPL_2.0-brightgreen.svg)](https://opensource.org/licenses/MPL-2.0)
[![en](https://img.shields.io/badge/README-en-green.svg)](https://github.com/aisa-it/aiplan-front/blob/main/README.md)
[![ru](https://img.shields.io/badge/README-ru-green.svg)](https://github.com/aisa-it/aiplan-front/blob/main/README.ru.md)
# AIPlan

Client-side application for AIPlan

Work only with Yarn package manager!

## Setup

Install dependencies

```bash
yarn install
```

Run linter

```bash
yarn lint
```

Run in development mode

```bash
yarn dev
```

Build application


```bash
yarn build
```

Before running, you need to set environment variables. An example is available in example.env

```bash
// API endpoint
VITE_API_URL="https://domain.com"

// Minio endpoint
VITE_MINIO_URL="https://domain.com"
```

## Running in SPA Mode

By default, the project runs in PWA mode. If necessary, you can disable it by modifying the startup scripts.

Run in development mode

```bash
quasar dev
```

Build application


```bash
quasar build
```
