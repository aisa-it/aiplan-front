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

## Translations (i18n)

The app uses [vue-i18n](https://vue-i18n.intlify.dev/) with `ru` (default) and `en`. UI text is never written as a literal in templates.

**Where a text goes**

1. Shared words (Save, Cancel, Email, Password…) live in `common.*` in `src/i18n/locales/{ru,en}.ts`. Check there first.
2. Everything else goes to the dictionary of the module or widget it belongs to:
   - module: `src/modules/<name>/i18n/{ru,en}.ts`
   - shared widget: `src/components/<name>/i18n/{ru,en}.ts`

**Adding a dictionary**

The folder name must be kebab-case; it becomes the namespace in camelCase (`user-status` → `userStatus`).

```ts
// src/components/user-status/i18n/ru.ts
export default {
  select: 'Выбрать статус',
  until: '(до {date})',
};

// src/components/user-status/i18n/en.ts
import type ru from './ru';

export default {
  select: 'Set status',
  until: '(until {date})',
} satisfies typeof ru;
```

No manual registration: `yarn dev` picks up new dictionaries automatically and writes the registry `src/i18n/generated/<locale>.ts` (or run `yarn i18n:generate`). Commit the registry, but never edit it by hand.

**Using it**

```ts
const { t } = useI18n();
t('userStatus.select');
t('userStatus.until', { date });
t('profile.notifications.deadline.hours', n); // '{n} час | {n} часа | {n} часов'
```

Markup inside a sentence goes through `<i18n-t>` with slots, never `v-html`.

**Checks**

- `vue-tsc` fails if a key is missing in `en` or `en` has a key that `ru` doesn't.
- Generation fails with a clear message on a non-kebab-case folder, a missing `ru.ts`/`en.ts`, a duplicate or reserved namespace, or a dictionary outside the folders above.
- `yarn i18n:check` fails if the committed registry is stale.
- After changing `scripts/i18n-dictionaries.mjs`, run `yarn test`.

**Adding a language**: add it to `SUPPORTED_LOCALES`, `LOCALE_OPTIONS` and `localeLoaders` in `src/i18n/index.ts`, to `LOCALES` in `scripts/i18n-dictionaries.mjs`, create `src/i18n/locales/<locale>.ts` and a `<locale>.ts` in every dictionary folder.