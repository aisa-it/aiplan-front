<template>
  <NodeViewWrapper class="editor-mermaid-block" :class="{ 'editor-mermaid-block--editable': !readonly }">
    <div v-if="!readonly" class="editor-mermaid-block__header" contenteditable="false">
      <EditorIcon name="account-tree" :size="16" />
      <span class="editor-mermaid-block__title">Mermaid</span>
      <v-btn :aria-label="t('editor.deleteDiagram')" size="x-small" variant="text" color="text" class="editor-mermaid-block__delete" @click="deleteNode">
        <v-icon icon="mdi-delete" size="16" />
      </v-btn>
    </div>
    <pre v-show="!readonly" class="editor-mermaid-block__source"><NodeViewContent as="code" /></pre>
    <div class="editor-mermaid-block__preview" contenteditable="false">
      <div v-if="loading" class="editor-mermaid-block__hint">{{ t('editor.loadingDiagram') }}</div>
      <div v-else-if="!source.trim()" class="editor-mermaid-block__hint">{{ t('editor.enterDiagramText') }}</div>
      <div v-else-if="errorText" class="editor-mermaid-block__error">{{ errorText }}</div>
      <div v-else class="editor-mermaid-block__svg" v-html="svg" />
    </div>
  </NodeViewWrapper>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import { computed, inject, onBeforeUnmount, ref, watch } from 'vue';
import { NodeViewContent, NodeViewWrapper, nodeViewProps } from '@tiptap/vue-3';
import { useTheme } from 'vuetify';

import { EDITOR_READONLY_KEY } from '../model/editor.injection';
import { renderMermaidSvg } from '../utils/editorMermaidRender';
import EditorIcon from './EditorIcon.vue';

const { t } = useI18n();

const props = defineProps(nodeViewProps);
const theme = useTheme();
const readonly = inject(EDITOR_READONLY_KEY, computed(() => !props.editor.isEditable));
const source = computed(() => props.node.textContent);
const svg = ref('');
const errorText = ref('');
const loading = ref(true);
let renderToken = 0;
let debounceTimer: ReturnType<typeof setTimeout> | undefined;

const render = async () => {
  const token = ++renderToken;
  const code = source.value.trim();
  if (!code) {
    svg.value = '';
    errorText.value = '';
    loading.value = false;
    return;
  }
  loading.value = true;
  try {
    const result = await renderMermaidSvg(code, theme.current.value.dark);
    if (token !== renderToken) return;
    svg.value = result;
    errorText.value = '';
  } catch (error) {
    if (token !== renderToken) return;
    svg.value = '';
    errorText.value = error instanceof Error ? error.message : t('editor.couldNotRenderTheDiagram');
  } finally {
    if (token === renderToken) loading.value = false;
  }
};

watch(source, () => {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(render, 400);
});
watch(() => theme.current.value.dark, render);
render();

onBeforeUnmount(() => {
  if (debounceTimer) clearTimeout(debounceTimer);
  renderToken++;
});
</script>

<style scoped>
.editor-mermaid-block { margin: 8px 0; }
.editor-mermaid-block--editable { border: 1px solid rgb(var(--v-theme-border)); border-radius: 8px; }
.editor-mermaid-block__header { display: flex; align-items: center; gap: 6px; padding: 4px 8px; border-bottom: 1px solid rgb(var(--v-theme-border)); color: rgb(var(--v-theme-text)); opacity: .8; font-size: 12px; user-select: none; }
.editor-mermaid-block__title { flex: 1; }
.editor-mermaid-block__delete { width: 24px; min-width: 24px; height: 24px; }
.editor-mermaid-block__source { margin: 0; padding: 8px 12px; border-bottom: 1px dashed rgb(var(--v-theme-border)); background: var(--editor-code-block-bg); font: 13px/1.5 monospace; white-space: pre-wrap; }
.editor-mermaid-block__preview { padding: 8px 12px; overflow-x: auto; }
.editor-mermaid-block__svg { display: flex; justify-content: center; }
.editor-mermaid-block__svg :deep(svg) { max-width: 100%; height: auto; }
.editor-mermaid-block__hint { color: rgb(var(--v-theme-text)); opacity: .65; font-size: 12px; }
.editor-mermaid-block__error { color: rgb(var(--v-theme-error)); font-size: 12px; white-space: pre-wrap; overflow-wrap: anywhere; }
</style>
