<template>
  <NodeViewWrapper as="div" class="editor-spoiler">
    <div
      class="editor-spoiler__header"
      :class="{ 'editor-spoiler__header--expanded': expanded }"
      :style="node.attrs.style"
      contenteditable="false"
      :role="readonly ? 'button' : undefined"
      :tabindex="readonly ? 0 : undefined"
      :aria-expanded="readonly ? expanded : undefined"
      @click="expanded = !expanded"
      @keydown.enter.self.prevent="expanded = !expanded"
      @keydown.space.self.prevent="expanded = !expanded"
    >
      <v-icon
        icon="mdi-chevron-right"
        size="20"
        class="editor-spoiler__chevron"
      />
      <span v-if="readonly" class="editor-spoiler__title">{{ title || 'Спойлер' }}</span>
      <input
        v-else
        v-model="title"
        :readonly="readonly"
        placeholder="Спойлер"
        aria-label="Заголовок спойлера"
        class="editor-spoiler__title"
        @focus="selectEditorBlockContent(editor, getPos)"
        @blur="updateTitle"
        @click.stop
        @keydown.enter.prevent
      />
      <v-btn
        v-if="!readonly"
        icon="mdi-close"
        aria-label="Удалить спойлер"
        size="x-small"
        variant="text"
        @click.stop="deleteSpoiler"
      />
    </div>

    <div v-show="expanded" class="editor-spoiler__content">
      <span v-if="isEmpty" class="editor-spoiler__placeholder">
        Скрытый контент
      </span>
      <NodeViewContent />
    </div>
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

const props = defineProps(nodeViewProps);
const injectedReadonly = inject(EDITOR_READONLY_KEY);
const readonly = computed(
  () => injectedReadonly?.value ?? !props.editor.isEditable,
);
const expanded = ref(!readonly.value || !props.node.attrs.collapsed);
const title = ref(props.node.attrs.title);
const isEmpty = computed(
  () =>
    props.node.childCount === 1 &&
    props.node.firstChild?.type.name === 'paragraph' &&
    props.node.firstChild.content.size === 0,
);

const updateTitle = () => {
  if (readonly.value || title.value === props.node.attrs.title) return;
  props.updateAttributes({ title: title.value });
  selectEditorBlockContent(props.editor, props.getPos);
};

const deleteSpoiler = () => {
  const pos = props.getPos();
  if (typeof pos !== 'number') return;

  const paragraph = props.editor.state.schema.nodes.paragraph.create();
  const transaction = props.editor.state.tr.replaceWith(
    pos,
    pos + props.node.nodeSize,
    paragraph,
  );
  props.editor.view.dispatch(transaction);
  props.editor.view.focus();
};

watch(readonly, (value) => {
  expanded.value = value ? !props.node.attrs.collapsed : true;
});
watch(
  () => props.node.attrs.title,
  (value) => {
    title.value = value;
  },
);
</script>

<style scoped>
.editor-spoiler__header {
  display: flex;
  align-items: center;
  min-height: 34px;
  padding: 3px 6px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 150ms ease;
}

.editor-spoiler__header:hover {
  background-color: rgba(var(--v-theme-on-surface), 0.06);
}

.editor-spoiler__header:focus-visible {
  outline: 2px solid rgb(var(--v-theme-primary));
  outline-offset: 2px;
}

.editor-spoiler__chevron {
  transition: transform 150ms ease;
}

.editor-spoiler__header--expanded .editor-spoiler__chevron {
  transform: rotate(90deg);
}

.editor-spoiler__title {
  flex: 1 1 auto;
  min-width: 0;
  border: 0;
  outline: none;
  background: transparent;
  color: inherit;
  font: inherit;
  overflow-wrap: anywhere;
}

.editor-spoiler__content {
  position: relative;
  padding: 0 8px 0 28px;
}

.editor-spoiler__placeholder {
  position: absolute;
  color: rgb(var(--v-theme-text), 0.55);
  pointer-events: none;
}
</style>
