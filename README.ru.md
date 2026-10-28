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

## Переводы (i18n)

В приложении [vue-i18n](https://vue-i18n.intlify.dev/), языки `ru` (по умолчанию) и `en`. Тексты интерфейса литералами в шаблонах не пишем.

**Куда класть текст**

1. Общие слова («Сохранить», «Отменить», «Email», «Пароль»…) — в `common.*` в `src/i18n/locales/{ru,en}.ts`. Сначала ищите там.
2. Всё остальное — в словарь модуля или виджета, к которому текст относится:
   - модуль: `src/modules/<имя>/i18n/{ru,en}.ts`
   - общий виджет: `src/components/<имя>/i18n/{ru,en}.ts`

**Новый словарь**

Имя папки — в kebab-case, из него получается неймспейс в camelCase (`user-status` → `userStatus`).

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

Регистрировать вручную не нужно: `yarn dev` сам подхватывает новые словари и пишет реестр `src/i18n/generated/<язык>.ts` (или запустите `yarn i18n:generate`). Реестр коммитится, но руками не правится.

**Использование**

```ts
const { t } = useI18n();
t('userStatus.select');
t('userStatus.until', { date });
t('profile.notifications.deadline.hours', n); // '{n} час | {n} часа | {n} часов'
```

Разметка внутри фразы — через `<i18n-t>` со слотами, не через `v-html`.

**Проверки**

- `vue-tsc` падает, если в `en` не хватает ключа или есть ключ, которого нет в `ru`.
- Генерация падает с понятной ошибкой, если имя папки не в kebab-case, нет `ru.ts`/`en.ts`, неймспейс повторяется или зарезервирован, или словарь лежит не в папках выше.
- `yarn i18n:check` падает, если закоммиченный реестр устарел.
- После правки `scripts/i18n-dictionaries.mjs` запустите `yarn test`.

**Новый язык**: добавить его в `SUPPORTED_LOCALES`, `LOCALE_OPTIONS` и `localeLoaders` в `src/i18n/index.ts`, в `LOCALES` в `scripts/i18n-dictionaries.mjs`, создать `src/i18n/locales/<язык>.ts` и `<язык>.ts` в каждой папке словаря.
