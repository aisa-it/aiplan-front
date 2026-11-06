<template>
  <NodeViewWrapper as="div" class="editor-info-block">
    <div class="editor-info-block__header" contenteditable="false">
      <v-icon :icon="icon" :color="node.attrs.iconColor" size="18" />
      <span v-if="readonly" class="editor-info-block__title">{{ title }}</span>
      <input
        v-else
        v-model="title"
        :readonly="readonly"
        placeholder="Введите текст"
        aria-label="Заголовок информационного блока"
        class="editor-info-block__title"
        @focus="selectEditorBlockContent(editor, getPos)"
        @blur="updateTitle"
        @keydown.enter.prevent
      />
    </div>
    <NodeViewContent class="editor-info-block__content" />
  </NodeViewWrapper>
</template>

<script setup lang="ts">
import { computed, inject, ref, watch } from 'vue';
import {
  NodeViewContent,
  NodeViewWrapper,
  nodeViewProps,
} from '@tiptap/vue-3';

import { EDITOR_READONLY_KEY } from '../model/editor.injection';
import { selectEditorBlockContent } from '../utils/selectEditorBlockContent';

const ICONS: Record<string, string> = {
  infoIcon: 'mdi-information-outline',
  checkStatusIcon: 'mdi-check-circle-outline',
  closeIconBorder: 'mdi-close-box-outline',
  alertIcon: 'mdi-alert-outline',
};

const props = defineProps(nodeViewProps);
const injectedReadonly = inject(EDITOR_READONLY_KEY);
const readonly = computed(
  () => injectedReadonly?.value ?? !props.editor.isEditable,
);
const title = ref(props.node.attrs.title);
const icon = computed(() => ICONS[props.node.attrs.icon] ?? ICONS.infoIcon);

const updateTitle = () => {
  if (readonly.value || title.value === props.node.attrs.title) return;
  props.updateAttributes({ title: title.value });
  selectEditorBlockContent(props.editor, props.getPos);
};

watch(
  () => props.node.attrs.title,
  (value) => {
    title.value = value;
  },
);
</script>

<style scoped>
.editor-info-block {
  margin-top: 5px;
  padding: 12px;
  border: 2px solid rgb(var(--v-theme-primary));
  border-radius: 6px;
}

.editor-info-block__header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
  padding-bottom: 5px;
  border-bottom: 1px solid rgb(var(--v-theme-primary));
}

.editor-info-block__title {
  flex: 1 1 auto;
  min-width: 0;
  border: 0;
  outline: none;
  background: transparent;
  color: inherit;
  font: inherit;
  font-weight: 500;
  line-height: 14px;
  max-height: 14px;
  overflow-wrap: anywhere;
}

</style>
