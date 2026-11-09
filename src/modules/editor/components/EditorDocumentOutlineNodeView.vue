<template>
  <NodeViewWrapper class="editor-document-outline" contenteditable="false">
    <div v-if="!isReadonly" class="editor-document-outline__placeholder">
      <span>{{ t('editor.tableOfContents') }}</span>
      <v-btn
        icon="mdi-close"
        :aria-label="t('editor.deleteTableOfContents')"
        variant="text"
        size="x-small"
        @click="removeNode"
      />
    </div>
    <nav
      v-else-if="savedLinks.length"
      class="editor-document-outline__links"
      :aria-label="t('editor.documentTableOfContents')"
    >
      <a
        v-for="(link, index) in savedLinks"
        :key="`${link.id}-${index}`"
        :href="`#${link.anchorId || link.id}`"
        class="editor-document-outline__link"
        :style="{ paddingInlineStart: `${30 * (link.originalLevel - 1)}px` }"
        @click.prevent="goToHeading(link, index)"
      >
        {{ /^\d/.test(link.text.trim()) ? '' : `${link.index} `
        }}{{ link.text }}
      </a>
    </nav>
    <NodeViewContent class="editor-document-outline__source" />
  </NodeViewWrapper>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import { computed, inject, shallowRef } from 'vue';
import { NodeViewContent, NodeViewWrapper, nodeViewProps } from '@tiptap/vue-3';

import { useEditorHeadings } from '../composables/useEditorHeadings';
import { EDITOR_READONLY_KEY } from '../model/editor.injection';

const { t } = useI18n();

interface SavedLink {
  id: string;
  anchorId?: string | null;
  text: string;
  index: string;
  originalLevel: number;
}

const props = defineProps(nodeViewProps);
const isReadonly = inject(
  EDITOR_READONLY_KEY,
  computed(() => !props.editor.isEditable),
);
const { links: currentHeadings, scrollTo } = useEditorHeadings(
  shallowRef(props.editor),
);

const savedLinks = computed<SavedLink[]>(() => {
  const raw = props.node.attrs.links;
  if (typeof raw !== 'string') return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (link): link is SavedLink =>
        link !== null &&
        typeof link === 'object' &&
        typeof link.id === 'string' &&
        typeof link.text === 'string' &&
        typeof link.index === 'string' &&
        Number.isInteger(link.originalLevel) &&
        link.originalLevel >= 1 &&
        link.originalLevel <= 6,
    );
  } catch {
    return [];
  }
});

const goToHeading = (link: SavedLink, index: number) => {
  const headings = currentHeadings.value;
  const target =
    (link.anchorId &&
      headings.find((heading) => heading.anchorId === link.anchorId)) ||
    headings.find((heading) => heading.id === link.id) ||
    headings[index] ||
    headings.find(
      (heading) =>
        heading.text === link.text && heading.level === link.originalLevel,
    );
  if (target) scrollTo(target);
};

const removeNode = () => {
  if (isReadonly.value) return;
  props.deleteNode();
};
</script>

<style scoped>
.editor-document-outline:not(
  :has(.editor-document-outline__placeholder, .editor-document-outline__links)
) {
  display: none;
}
.editor-document-outline__source {
  display: none;
}
.editor-document-outline__placeholder {
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: 5px;
  padding: 4px 4px 4px 12px;
  border: 2px solid rgb(var(--v-theme-border));
  border-radius: 6px;
}
.editor-document-outline .editor-document-outline__link {
  display: block;
  width: fit-content;
  text-decoration: none;
  color: var(--editor-toc-link-color);
  cursor: pointer;
}
.editor-document-outline .editor-document-outline__link::before {
  content: '• ';
  display: inline-block;
  width: 1em;
  color: rgb(var(--v-theme-text));
}
</style>
