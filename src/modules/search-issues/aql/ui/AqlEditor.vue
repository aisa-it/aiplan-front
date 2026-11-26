<template>
  <div
    ref="rootRef"
    class="aql-editor"
    :class="{ 'aql-editor--error': !!error }"
  >
    <div class="aql-editor__stack">
      <!-- Слой подсветки: задаёт высоту поля и лежит под прозрачным textarea -->
      <div
        ref="highlightRef"
        class="aql-editor__layer aql-editor__highlight"
        aria-hidden="true"
      >
        <span
          v-for="(part, index) in view.before"
          :key="`b${index}`"
          :class="`aql-token--${part.type}`"
          >{{ part.text }}</span
        >
        <span
          v-if="view.marked.length"
          class="aql-editor__error"
          data-aql-error
        >
          <span
            v-for="(part, index) in view.marked"
            :key="`m${index}`"
            :class="`aql-token--${part.type}`"
            >{{ part.text }}</span
          >
        </span>
        <span
          v-for="(part, index) in view.after"
          :key="`a${index}`"
          :class="`aql-token--${part.type}`"
          >{{ part.text }}</span
        >
        <span>{{ ZERO_WIDTH_SPACE }}</span>
      </div>

      <textarea
        ref="inputRef"
        class="aql-editor__layer aql-editor__input"
        rows="1"
        :value="modelValue"
        :placeholder="PLACEHOLDER"
        :aria-invalid="!!error"
        aria-label="Запрос AQL"
        spellcheck="false"
        autocomplete="off"
        autocorrect="off"
        autocapitalize="off"
        @input="onInput"
        @keydown.enter="onEnter"
        @mousemove="onMouseMove"
        @mouseleave="hideTip"
      ></textarea>
    </div>

    <q-tooltip
      v-if="error && tipTarget"
      :model-value="true"
      :target="tipTarget"
      no-parent-event
      anchor="bottom middle"
      self="top middle"
      :offset="[0, 6]"
      max-width="420px"
      class="aql-editor__tip"
    >
      {{ error.message }}
    </q-tooltip>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, shallowRef, watch } from 'vue';

import { tokenizeAql, type AqlTokenType } from '../utils/tokenize';

interface AqlError {
  message: string;
  // [start, end) в символах Юникода, не в UTF-16
  start: number;
  end: number;
}

interface Part {
  type: AqlTokenType;
  text: string;
}

const props = defineProps<{
  modelValue: string;
  error?: AqlError | null;
}>();

const emits = defineEmits<{
  'update:modelValue': [value: string];
  submit: [];
}>();

const PLACEHOLDER =
  'Запрос AQL, например: priority = high ORDER BY created DESC';
// Завершает слой подсветки: без него пустая последняя строка не получает высоты.
const ZERO_WIDTH_SPACE = '\u200B';
const NBSP = '\u00A0';

const rootRef = ref<HTMLElement | null>(null);
const inputRef = ref<HTMLTextAreaElement | null>(null);
const highlightRef = ref<HTMLElement | null>(null);
const tipTarget = shallowRef<HTMLElement | null>(null);

// Позиция в символах Юникода → индекс UTF-16.
function toUtf16Index(text: string, codePoints: number): number {
  let index = 0;
  for (let i = 0; i < codePoints && index < text.length; i++) {
    index += (text.codePointAt(index) ?? 0) > 0xffff ? 2 : 1;
  }
  return index;
}

const isLineBreak = (char: string) => char === '\n' || char === '\r';

// Диапазон подчёркивания в индексах UTF-16. marker — подчёркивать нечего,
// в позицию from вставляется пробел-маркер (только в слое подсветки).
const errorRange = computed(() => {
  const error = props.error;
  if (!error) return null;

  const text = props.modelValue;
  const from = toUtf16Index(text, Math.max(error.start, 0));
  const to = Math.max(toUtf16Index(text, Math.max(error.end, 0)), from);

  if ([...text.slice(from, to)].some((char) => !isLineBreak(char))) {
    return { from, to, marker: false };
  }

  // Ошибка нулевой ширины. В конце запроса — маркер после текста,
  // иначе подчёркиваем соседний символ: следующий либо предыдущий.
  if (from < text.length) {
    const next = [...text.slice(from, from + 2)][0];
    if (!isLineBreak(next)) {
      return { from, to: from + next.length, marker: false };
    }

    const prev = [...text.slice(Math.max(from - 2, 0), from)].pop();
    if (prev && !isLineBreak(prev)) {
      return { from: from - prev.length, to: from, marker: false };
    }
  }

  return { from, to: from, marker: true };
});

const view = computed(() => {
  const tokens = tokenizeAql(props.modelValue);
  const range = errorRange.value;
  if (!range) return { before: tokens as Part[], marked: [], after: [] };

  const before: Part[] = [];
  const marked: Part[] = [];
  const after: Part[] = [];

  for (const token of tokens) {
    const cut = (list: Part[], from: number, to: number) => {
      if (to <= from) return;
      const text = token.text.slice(from - token.start, to - token.start);
      list.push({ type: token.type, text });
    };

    cut(before, token.start, Math.min(token.end, range.from));
    cut(
      marked,
      Math.max(token.start, range.from),
      Math.min(token.end, range.to),
    );
    cut(after, Math.max(token.start, range.to), token.end);
  }

  if (range.marker) marked.push({ type: 'other', text: NBSP });

  return { before, marked, after };
});

function onInput(event: Event) {
  hideTip();
  emits('update:modelValue', (event.target as HTMLTextAreaElement).value);
}

function onEnter(event: KeyboardEvent) {
  if (event.shiftKey || event.isComposing) return;
  event.preventDefault();
  emits('submit');
}

// textarea перекрывает слой подсветки, поэтому подчёркнутый участок ищем по координатам.
function onMouseMove(event: MouseEvent) {
  if (!props.error) return;
  const target = document
    .elementsFromPoint(event.clientX, event.clientY)
    .find(
      (el) =>
        el instanceof HTMLElement &&
        el.dataset.aqlError !== undefined &&
        highlightRef.value?.contains(el),
    );
  tipTarget.value = (target as HTMLElement | undefined) ?? null;
}

function hideTip() {
  tipTarget.value = null;
}

// Слой подсветки перерисовывается — прежний элемент подсказки может исчезнуть.
watch(() => [props.modelValue, props.error], hideTip);

// Браузер прокручивает к каретке раньше, чем поле вырастет под новый текст,
// поэтому при вводе в конец запроса докручиваем сами.
watch(
  () => props.modelValue,
  () => {
    const input = inputRef.value;
    const root = rootRef.value;
    if (!input || !root || document.activeElement !== input) return;
    if (input.selectionStart === input.value.length) {
      root.scrollTop = root.scrollHeight;
    }
  },
  { flush: 'post' },
);

function focus() {
  inputRef.value?.focus();
}

defineExpose({ focus });
</script>

<style scoped lang="scss">
$line-height: 24px;
$max-lines: 8;

.aql-editor {
  --aql-keyword: #3f75ff;
  --aql-operator: #c2255c;
  --aql-string: #1a7f37;
  --aql-number: #b35900;
  --aql-duration: #0e7c86;
  --aql-function: #8e44ad;
  --aql-error: #dc3e3e;
  --aql-error-bg: rgba(220, 62, 62, 0.12);
  --aql-selection: rgba(63, 117, 255, 0.3);

  width: 100%;
  min-width: 0;
  // одна строка — 40px вместе с линией, как у base-input
  max-height: $line-height * $max-lines + 16px;
  overflow-x: hidden;
  overflow-y: auto;
  border-bottom: 1px solid $dark-border-color;
  color: $text-color;
  font-size: 14px;
  font-weight: 400;
  line-height: $line-height;
  letter-spacing: 0.00937em;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;

  &:hover {
    border-bottom-color: $primary;
  }

  &:focus-within {
    border-bottom-color: $primary;
    box-shadow: 0 1px 0 0 $primary;
  }

  &--error,
  &--error:hover {
    border-bottom-color: var(--aql-error);
  }

  &--error:focus-within {
    box-shadow: 0 1px 0 0 var(--aql-error);
  }
}

.body--dark .aql-editor {
  --aql-keyword: #7aa2ff;
  --aql-operator: #ff8fb1;
  --aql-string: #7ec699;
  --aql-number: #f0a45d;
  --aql-duration: #56c8d8;
  --aql-function: #c792ea;
  --aql-error: #ff6b6b;
  --aql-error-bg: rgba(255, 107, 107, 0.16);
  --aql-selection: rgba(86, 133, 251, 0.4);
}

// Слои лежат в одной ячейке: высоту задаёт подсветка, textarea растягивается следом.
.aql-editor__stack {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
}

// Всё, что влияет на раскладку текста, у слоёв обязано совпадать.
.aql-editor__layer {
  grid-area: 1 / 1;
  box-sizing: border-box;
  min-width: 0;
  margin: 0;
  padding: 8px 0 7px;
  border: 0;
  font: inherit;
  letter-spacing: inherit;
  // кернинг и лигатуры на границах span считаются иначе, чем в сплошном тексте
  font-kerning: none;
  font-variant-ligatures: none;
  tab-size: 4;
  white-space: pre-wrap;
  overflow-wrap: break-word;
  word-break: break-word;
}

.aql-editor__highlight {
  color: $text-color;
}

.aql-editor__input {
  display: block;
  width: 100%;
  resize: none;
  overflow: hidden;
  outline: none;
  background: transparent;
  color: transparent;
  caret-color: $text-color;

  &::placeholder {
    overflow: hidden;
    color: $sub-text-color;
    opacity: 1;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &::selection {
    background: var(--aql-selection);
    color: transparent;
  }
}

.aql-token {
  &--keyword {
    color: var(--aql-keyword);
  }
  &--operator {
    color: var(--aql-operator);
  }
  &--string {
    color: var(--aql-string);
  }
  &--number {
    color: var(--aql-number);
  }
  &--duration {
    color: var(--aql-duration);
  }
  &--function {
    color: var(--aql-function);
  }
  &--other {
    color: var(--aql-error);
  }
}

.aql-editor__error {
  background: var(--aql-error-bg);
  text-decoration: underline wavy var(--aql-error);
  text-decoration-skip-ink: none;
  text-underline-offset: 3px;
}
</style>

<style lang="scss">
// Подсказка рендерится вне компонента, scoped до неё не дотягивается.
.q-tooltip.aql-editor__tip {
  font-size: 12px;
  white-space: pre-wrap;
  overflow-wrap: break-word;
}
</style>
