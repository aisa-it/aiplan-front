# Настройка VTextField по умолчанию

Документация к секции `defaults.VTextField` в `src/plugins/vuetify/vuetify.ts` (Vuetify 4.1.5, blueprint `md3`).

## Где это настраивается

```ts
// src/plugins/vuetify/vuetify.ts
const vuetify = createVuetify({
  blueprint: md3,
  defaults: {
    VTextField: {
      color: 'primary',
      variant: 'underlined',
    },
  },
});
```

`defaults` задаёт пропсы, которые получает **каждый** `VTextField` в приложении. Проп, переданный на конкретном `<v-text-field>`, перекрывает default; если проп не передан (или `undefined`), берётся default.

`md3` из `vuetify/blueprints` уже задаёт `VTextField: { variant: 'outlined' }` — блок `defaults` в проекте его перекрывает.

Настройка действует **только на `VTextField`**. У `VSelect`, `VAutocomplete` и `VTextarea` — отдельные ключи `defaults` (в проекте они уже настроены).

## Внешний вид и геометрия

| Проп | Значения | Что делает |
|---|---|---|
| `variant` | `'underlined'`, `'outlined'`, `'filled'`, `'solo'`, `'solo-filled'`, `'solo-inverted'`, `'plain'` | стиль поля |
| `density` | `'default'`, `'comfortable'`, `'compact'` | высота/плотность |
| `rounded` | `boolean \| number \| string` | скругление |
| `tile` | `boolean` | убрать скругление (противоположность `rounded`) |
| `flat` | `boolean` | без тени |
| `singleLine` | `boolean` | одна строка без переноса лейбла |
| `reverse` | `boolean` | развернуть направление |
| `centerAffix` | `boolean` | центрировать иконки по вертикали |
| `hideSpinButtons` | `boolean` | скрыть стрелки у `type="number"` |
| `width`, `minWidth`, `maxWidth` | `string \| number` | размеры |

## Цвета

| Проп | Что делает |
|---|---|
| `color` | цвет в фокусе/активный (в проекте — `primary`) |
| `baseColor` | цвет в неактивном состоянии (линия, лейбл) |
| `bgColor` | фон (актуально для `filled`/`solo`) |
| `iconColor` | цвет иконок |

## Детали, подсказки и ошибки

| Проп | Значения | Что делает |
|---|---|---|
| `hideDetails` | `boolean \| 'auto'` | скрывать блок подсказок/ошибок |
| `messages` | `string \| string[]` | постоянные сообщения |
| `errorMessages` | `string \| string[]` | сообщения об ошибке |
| `maxErrors` | `number \| string` | сколько ошибок показывать |
| `hint` | `string` | подсказка |
| `persistentHint` | `boolean` | не скрывать hint без фокуса |
| `indentDetails` | `boolean` | отступ блока деталей |
| `direction` | `'horizontal' \| 'vertical'` | расположение деталей |

## Иконки и очистка

`prependIcon`, `appendIcon`, `prependInnerIcon`, `appendInnerIcon`, `clearIcon`, `clearable`, `persistentClear`.

## Поведение и состояние

`disabled`, `readonly`, `error`, `focused`, `active`, `dirty`, `loading`, `name`, `id`, `role`, `autocomplete`, `autofocus`, `type`, `rules`, `validateOn`, `validationValue`, `modelValue`, `modelModifiers`.

## Текст

`label`, `placeholder`, `persistentPlaceholder`, `prefix`, `suffix`, `counter`, `counterValue`, `persistentCounter`.

## События

Их тоже можно задать глобально; ключи с двоеточием пишутся в кавычках:

```ts
defaults: {
  VTextField: {
    'onUpdate:focused': (value: boolean) => console.log('focused', value),
    'onClick:appendInner': () => {},
  },
}
```

Доступны: `'onClick:prepend'`, `'onClick:append'`, `'onClick:prependInner'`, `'onClick:appendInner'`, `'onClick:clear'`, `'onUpdate:focused'`.

Плюс `class` и `style` — применяются к корню поля.

## Что стоит задавать глобально

Осмысленные общие дефолты:

- `variant`, `color`, `baseColor`, `density`
- `rounded` / `flat`
- `hideDetails`, `indentDetails`, `direction`
- `centerAffix`, `singleLine`, `validateOn`, `hideSpinButtons`
- `persistentHint`
- `clearable` (если «крестик» нужен везде)

**Не стоит** класть в глобальные дефолты: `label`, `placeholder`, `rules`, `modelValue`, `messages`, `errorMessages`, `type`, `autocomplete`, `disabled`, `readonly`, `prefix` / `suffix`, `counter` — это почти всегда контекст конкретного поля.

## Пример расширенной настройки

```ts
defaults: {
  VTextField: {
    variant: 'underlined',
    color: 'primary',
    baseColor: 'border',
    density: 'comfortable',
    hideDetails: 'auto',
    validateOn: 'blur eager',
    singleLine: true,
  },
}
```

> `hideDetails: 'auto'` и `density: 'comfortable'` заметно меняют вертикальные отступы форм — включайте осознанно и проверяйте существующие формы.

## Связанные файлы

- [TEXTFIELD-VARIANTS.md](./TEXTFIELD-VARIANTS.md) — как завести несколько вариантов TextField с разными настройками (aliases, пресеты, `VDefaultsProvider`).
- `src/plugins/vuetify/vuetify.ts` — конфигурация Vuetify (темы, `defaults`).
- `src/plugins/vuetify/index.ts` — точка входа, реэкспорт конфигурации (импортируется как `@/plugins/vuetify`).
- `src/components/app-text-field/` — проектная обёртка `AppTextField`; её локальные дефолты лежат в `AppTextField.config.ts` и применяются только к ней.

Актуальный список пропсов всегда можно посмотреть в типах `VTextField` (`vuetify/components`).
