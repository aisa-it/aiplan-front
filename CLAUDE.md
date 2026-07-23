# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Install dependencies (yarn only, npm won't work)
yarn

# Run dev server
yarn dev

# Build for production
yarn build

# Preview production build
yarn preview
```

- **Node**: >= 20
- **Package manager**: Yarn >= 1.21.1

## Environment

Copy `.env.example` to `.env.local` and set:

```
VITE_API_URL="https://domain.com"
VITE_MINIO_URL="https://domain.com"
```

## Architecture

### Stack

**Vue 3** (Composition API + `<script setup>`) + **Vuetify 4** (Material Design 3 blueprint) + **Tailwind CSS v4** + **Pinia** state management + **TypeScript** + **Vite**.

Routing via **vue-router 4** (history mode).

### Project Structure

```
├── src/
│   ├── main.ts           # Entry point: Pinia + Router + Vuetify
│   ├── App.vue            # Root component (<router-view />)
│   ├── style.css          # Tailwind CSS v4 entry (@import "tailwindcss")
│   ├── plugins/
│   │   └── vuetify.ts     # Vuetify 4 config (MD3, themes, defaults)
│   ├── router/
│   │   └── index.ts       # Vue Router routes
│   ├── stores/            # Pinia stores (Composition API)
│   └── views/             # Page components
├── public/
├── vite.config.ts         # Vite config with Vuetify + Tailwind plugins, @/ alias
├── tsconfig.json
├── tsconfig.app.json      # Path alias @/ → src/*
└── tsconfig.node.json
```

### Key Libraries

- **Vuetify 4** — Material Design 3 components via `vite-plugin-vuetify` (auto-import enabled)
- **Tailwind CSS v4** — utility-first CSS via `@tailwindcss/vite` plugin
- **Pinia** — state management (Composition API stores)
- **Vue Router 4** — client-side routing with history mode
