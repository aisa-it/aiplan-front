<template>
  <v-select
    :model-value="modelValue"
    :items="items"
    :disabled="disabled"
    :aria-label="tooltip"
    :title="tooltip"
    :style="{ width }"
    :menu-props="headingPreview ? { contentClass: 'editor-heading-select-menu' } : undefined"
    item-title="title"
    item-value="value"
    density="compact"
    hide-details
    variant="plain"
    class="editor-toolbar-select"
    @update:model-value="updateModelValue"
  >
    <template v-if="headingPreview" #item="{ props: itemProps, item }">
      <v-list-item v-bind="itemProps" class="editor-heading-select-menu__item">
        <template #title>
          <span :class="`editor-heading-select-menu__preview--${item.value}`">{{ item.title }}</span>
        </template>
      </v-list-item>
    </template>
  </v-select>
</template>

<script setup lang="ts">
import type { EditorSelectOption } from '../model/editor.types';

withDefaults(
  defineProps<{
    modelValue: string | number;
    items: EditorSelectOption[];
    tooltip: string;
    width?: string;
    disabled?: boolean;
    headingPreview?: boolean;
  }>(),
  {
    width: '112px',
    disabled: false,
    headingPreview: false,
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: string | number];
}>();

const updateModelValue = (value: unknown) => {
  if (typeof value === 'string' || typeof value === 'number') {
    emit('update:modelValue', value);
  }
};
</script>

<style scoped>
.editor-toolbar-select {
  flex: 0 0 auto;
  font-size: 12px;
}

.editor-toolbar-select :deep(.v-field) {
  padding: 0 4px;
  border-radius: 6px;
}

.editor-toolbar-select :deep(.v-field__input) {
  min-height: 24px;
  padding: 0;
  font-size: 12px;
}

.editor-toolbar-select :deep(.v-field__append-inner) {
  align-items: center;
  padding: 0;
}

:global(.editor-heading-select-menu .editor-heading-select-menu__item) {
  min-height: 32px;
  padding: 3px 10px;
}

:global(.editor-heading-select-menu .v-list-item-title) {
  overflow: visible;
  font-family: sans-serif;
  line-height: 1.1;
}

:global(.editor-heading-select-menu__preview--0) { font-size: 14px; font-weight: 400; }
:global(.editor-heading-select-menu__preview--1) { font-size: 24.01px; font-weight: 400; }
:global(.editor-heading-select-menu__preview--2) { font-size: 21px; font-weight: 400; }
:global(.editor-heading-select-menu__preview--3) { font-size: 18.2px; font-weight: 600; }
:global(.editor-heading-select-menu__preview--4) { font-size: 16.1px; font-weight: 600; }
:global(.editor-heading-select-menu__preview--5) { font-size: 14px; font-weight: 600; }
:global(.editor-heading-select-menu__preview--6) { font-size: 11.9px; font-weight: 600; }
</style>
