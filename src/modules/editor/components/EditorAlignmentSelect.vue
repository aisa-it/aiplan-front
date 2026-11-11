<template>
  <v-menu>
    <template #activator="{ props: menuProps }">
      <v-tooltip :text="currentOption.tooltip" location="bottom">
        <template #activator="{ props: tooltipProps }">
          <v-btn
            v-bind="{ ...menuProps, ...tooltipProps }"
            :aria-label="currentOption.tooltip"
            color="text"
            :disabled="disabled"
            icon
            size="small"
            variant="text"
            class="editor-alignment-select"
          >
            <EditorIcon :name="currentOption.icon" />
          </v-btn>
        </template>
      </v-tooltip>
    </template>

    <v-list density="compact">
      <v-list-item
        v-for="option in EDITOR_ALIGNMENT_OPTIONS"
        :key="option.value"
        :active="option.value === modelValue"
        :title="option.tooltip"
        color="primary"
        @click="emit('update:modelValue', option.value)"
      >
        <template #prepend>
          <EditorIcon :name="option.icon" />
        </template>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import { EDITOR_ALIGNMENT_OPTIONS } from '../constants/editor.constants';
import type { EditorTextAlignment } from '../model/editor.types';
import EditorIcon from './EditorIcon.vue';

const props = withDefaults(
  defineProps<{
    modelValue: EditorTextAlignment;
    disabled?: boolean;
  }>(),
  {
    disabled: false,
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: EditorTextAlignment];
}>();

const currentOption = computed(
  () =>
    EDITOR_ALIGNMENT_OPTIONS.find(
      (option) => option.value === props.modelValue,
    ) ?? EDITOR_ALIGNMENT_OPTIONS[0],
);
</script>

<style scoped>
.editor-alignment-select {
  width: 24px;
  min-width: 24px;
  height: 24px;
  border-radius: 4px;
}
</style>
