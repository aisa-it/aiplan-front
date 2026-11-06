<template>
  <NodeViewWrapper class="editor-code-block">
    <pre><NodeViewContent as="code" /></pre>
  </NodeViewWrapper>
</template>

<script setup lang="ts">
import { NodeViewContent, NodeViewWrapper, nodeViewProps } from '@tiptap/vue-3';

defineProps(nodeViewProps);
</script>

<style scoped>
.editor-code-block {
  margin: 5px 0;
  border-radius: 8px;
  overflow: hidden;
  background-color: var(--editor-code-block-bg);
}
.editor-code-block :deep(pre) {
  margin: 0;
}
.editor-code-block :deep(.hljs-comment),
.editor-code-block :deep(.hljs-quote) {
  color: #616161;
}
.editor-code-block :deep(.hljs-variable),
.editor-code-block :deep(.hljs-template-variable),
.editor-code-block :deep(.hljs-attribute),
.editor-code-block :deep(.hljs-tag),
.editor-code-block :deep(.hljs-name),
.editor-code-block :deep(.hljs-regexp),
.editor-code-block :deep(.hljs-link),
.editor-code-block :deep(.hljs-selector-id),
.editor-code-block :deep(.hljs-selector-class) {
  color: #f98181;
}
.editor-code-block :deep(.hljs-number),
.editor-code-block :deep(.hljs-meta),
.editor-code-block :deep(.hljs-built_in),
.editor-code-block :deep(.hljs-builtin-name),
.editor-code-block :deep(.hljs-literal),
.editor-code-block :deep(.hljs-type),
.editor-code-block :deep(.hljs-params) {
  color: #fbbc88;
}
.editor-code-block :deep(.hljs-string),
.editor-code-block :deep(.hljs-symbol),
.editor-code-block :deep(.hljs-bullet) {
  color: #21ba45;
}
.editor-code-block :deep(.hljs-title),
.editor-code-block :deep(.hljs-section) {
  color: var(--editor-code-text-color);
}
.editor-code-block :deep(.hljs-keyword),
.editor-code-block :deep(.hljs-selector-tag) {
  color: var(--editor-code-keyword-color);
}
.editor-code-block :deep(.hljs-emphasis) {
  font-style: italic;
}
.editor-code-block :deep(.hljs-strong) {
  font-weight: 700;
}
</style>
