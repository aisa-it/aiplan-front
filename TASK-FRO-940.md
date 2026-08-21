# Задача FRO-940 — привязка полей формы к параметрам проекта

> Контекст для продолжения работы. Ветка **`feat/FRO-938`** (ветка задачи, несмотря на номер в имени — делается из dev), изменения **не закоммичены**.

## Суть задачи

Бэкенд **BAK-359** (ещё не установлен!) добавил полю формы атрибут `property_template_id` (UUID или null) — привязка к дополнительному параметру (`ProjectPropertyTemplate`) целевого проекта. Значение ответа на такое поле записывается в кастомное поле создаваемой задачи.

Требования из задачи:
1. В конструкторе полей формы — селект «Записывать в параметр задачи»: только при выбранном целевом проекте формы и для совместимых типов полей
2. Список параметров — из API `PropertyTemplates` (клиент aiplan-api-ts). Совместимость: `string` ← input/textarea/numeric/color; `boolean` ← checkbox; `select` ← select. **attachment/multiselect/date — селект не показывать** (дата сознательно исключена: её значение уходит как ms-timestamp-число, а string-параметр ждёт строку — решение пользователя «дату не ставим в строку»). Параметры `link` не предлагать
3. Не давать выбрать один параметр в двух полях (занятые скрывать)
4. Для select-полей предзаполнять варианты поля options параметра (если не заданы) + подсказка «Варианты поля должны входить в options параметра». Ошибку сохранения **код 3217** показывать текстом с бэка
5. При смене целевого проекта — сбрасывать настройки полей, зависящие от проекта
6. Обновить типы API-клиента (новое поле в types.FormFields)
7. Проверить после установки бэкенд-релиза с BAK-359

## Важно про пакет `@aisa-it/aiplan-api-ts`

- npm-реестр: последняя опубликованная версия **1.139.0** (от 22.06.2026). Теги v1.140.0/v1.141.0 в GitHub-репо пакета есть, но **код в них идентичен 1.139.0** (только правки CI `Update publish-npm.yml`; поле version в package.json пакета так и не подняли)
- Поэтому `package.json` сейчас указывает `"@aisa-it/aiplan-api-ts": "github:aisa-it/aiplan-api-ts#v1.141.0"` — yarn.lock зафиксирован на коммите `904b030e`. Решение пользователя: git-резолв оставить
- В установленном клиенте `TypesFormFields` **без** `property_template_id` → расширен локальный тип `ExtendedFormFields` (`src/interfaces/forms.ts`) с пометкой `fixme убрать, когда обновится тип в data-contracts`
- **Когда BAK-359 выкатят и перегенерят swagger-пакет** — вернуться на реестровую установку: `yarn add @aisa-it/aiplan-api-ts@^<новая_версия>` и убрать поле из `ExtendedFormFields`

## Изменённые файлы

| Файл | Что сделано |
|---|---|
| `src/components/forms/components/AiFormItemBody.vue` | Селект «Записывать в параметр задачи» в слоте `property-binding`; маппинг `FIELD_TYPE_TO_PROPERTY_TYPES`; computeds `showPropertyBinding` / `propertyBindingOptions` / `boundSelectTemplate`; `onPropertyTemplateSelect` (предзаполнение options для select) |
| `src/components/forms/components/AiFormQuestionBody.vue` | Добавлен слот `<slot name="property-binding">` |
| `src/components/forms/dialogs/FormDialog.vue` | Загрузка параметров проекта (`loadPropertyTemplates`), watch на `target_project_id` со сбросом настроек полей при смене проекта, обработка ошибки 3217 (диалог не закрывается), `resetProjectDependentSettings` |
| `src/components/forms/helper/helperForm.ts` | `validateFormWithSlug` пробрасывает `property_template_id`; `addQuestion` инициализирует `property_template_id: null` |
| `src/components/forms/services/api.ts` | Обёртка `getFormProjectPropertyTemplates` (PropertyTemplates + withInterceptors) |
| `src/interfaces/forms.ts` | `property_template_id?: string \| null` в `ExtendedFormFields` |
| `package.json` / `yarn.lock` | git-резолв aiplan-api-ts на тег v1.141.0 |
| `src/modules/git` | Подмодуль, сдвинулся от переключения веток — **к задаче отношения не имеет** |

## Ключевые решения и тонкости

- **Видимость селекта**: `propertyTemplates !== null` (целевой проект выбран) + тип совместим + **есть доступные параметры** (правка по просьбе пользователя). Исключение: у поля уже есть привязка, которой нет в списке (параметр удалён на бэке) — селект показываем, чтобы можно было снять привязку, иначе 3217 без выхода
- **Сброс при смене проекта** (`resetProjectDependentSettings`): `property_template_id = null` + `issue_name_field = false` (все настройки полей, зависящие от проекта). Срабатывает только при реальной смене проекта (old и new оба заданы) — при открытии формы на редактирование настройки сохраняются
- **Ошибка 3217**: текст с бэка показывает глобальный interceptor (`src/utils/interceptors.ts`, default-case → `data.ru_error`); в `save()` при 3217 диалог **не закрывается** (на прочие ошибки — как раньше)
- **Дубли**: параметры, привязанные к другим полям формы, фильтруются из options (`usedPropertyTemplateIds`)
- `computedValue.value.type` — `string | undefined`, индексация маппинга через `?? ''`

## Проверки на текущий момент

- `npx quasar build` (SPA) — ✅ успешно
- `yarn lint` — **сломан в репозитории в целом** (eslint ^9.38.0 не читает `.eslintrc.cjs`, требуется eslint.config.js) — не связано с задачей
- tsc-ошибок в изменённых `.ts`-файлах нет; остальные ошибки tsc — базовые, существовали до правок; vue-tsc в проекте не установлен
- **Проверка на живом бэке — после установки релиза с BAK-359** (привязки, 3217, предзаполнение select-options)

## Состояние git

Ветка `feat/FRO-938` создана из `dev` (27bdd2c), содержит cherry-pick коммита `38ec025` → `bba8301` («feat: подсказки редактора сценариев по кастомным полям и attachment_count»), запушена на origin. Оригинальный коммит остался на ветке `FRO-938` (тоже на origin).

Изменения по FRO-940 лежат в рабочей копии, **не закоммичены**. Внешние факты: `CLAUDE.md` в корне — untracked, создан отдельно.
