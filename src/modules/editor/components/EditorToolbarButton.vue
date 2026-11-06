<template>
  <v-tooltip :text="tooltip" location="bottom">
    <template #activator="{ props: tooltipProps }">
      <v-btn
        v-bind="{ ...tooltipProps, ...$attrs }"
        :aria-label="tooltip"
        :class="{ 'editor-toolbar-button--active': active }"
        :disabled="disabled"
        :color="active ? 'primary' : 'text'"
        :icon="isEditorIcon ? true : icon"
        size="small"
        variant="text"
        class="editor-toolbar-button"
        @mousedown.prevent
        @click="emit('click', $event)"
      >
        <EditorIcon v-if="isEditorIcon" :name="editorIconName" />
        <v-icon v-else :icon="icon" size="20" />
      </v-btn>
    </template>
  </v-tooltip>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import { isEditorIconName } from '../icons/editor-icons';
import EditorIcon from './EditorIcon.vue';

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    icon: string;
    tooltip: string;
    active?: boolean;
    disabled?: boolean;
  }>(),
  {
    active: false,
    disabled: false,
  },
);

const isEditorIcon = computed(() => isEditorIconName(props.icon));
const editorIconName = computed(() => {
  if (!isEditorIconName(props.icon)) {
    throw new Error(`Unknown editor icon: ${props.icon}`);
  }

  return props.icon;
});

const emit = defineEmits<{
  click: [event: MouseEvent];
}>();
</script>

<style scoped>
.editor-toolbar-button {
  width: 24px;
  min-width: 24px;
  height: 24px;
  border-radius: 4px;
}

.editor-toolbar-button--active {
  background-color: rgba(var(--v-theme-primary), 0.12);
}
</style>
