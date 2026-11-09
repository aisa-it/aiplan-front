<template>
  <NodeViewWrapper
    v-bind="HTMLAttributes"
    as="span"
    class="special-link-mention attachment-link editor-attachment-link"
    contenteditable="false"
    :title="tooltip"
  >
    <v-progress-circular v-if="loading" indeterminate size="14" width="2" />
    <span v-else>{{ title }}</span>
  </NodeViewWrapper>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import { computed, inject } from 'vue';
import { NodeViewWrapper, nodeViewProps } from '@tiptap/vue-3';

import { EDITOR_SPECIAL_LINK_RESOLVERS_KEY } from '../model/editor.injection';
import { useEditorLinkPreview } from '../composables/useEditorLinkPreview';
import type {
  EditorAttachmentLinkPreview,
  EditorSpecialLink,
} from '../model/editor.types';

const { t } = useI18n();

const props = defineProps(nodeViewProps);
const resolvers = inject(EDITOR_SPECIAL_LINK_RESOLVERS_KEY);

const link = computed<EditorSpecialLink>(() => ({
  kind: 'attachment',
  contextType: props.node.attrs.type,
  workspaceSlug: props.node.attrs.slug,
  projectIdentifier: props.node.attrs.projectIdentifier,
  issueId: props.node.attrs.currentIssueId,
  documentId: props.node.attrs.docId,
  originalUrl: props.node.attrs.originalUrl,
  title: props.node.attrs.title,
}));

const title = computed(() => link.value.title || '#attachment');
const tooltip = computed(() => {
  if (!preview.value?.sourceTitle) return;

  const source = link.value.contextType === 'aidoc' ? t('editor.attachmentDocumentTarget') : t('editor.attachmentTaskTarget');
  return t('editor.isAttachedTo', { p0: title.value, p1: source, p2: preview.value.sourceTitle });
});

const { loading, preview } = useEditorLinkPreview<EditorAttachmentLinkPreview>(
  () => link.value,
  () => resolvers?.resolveAttachmentLink,
);
</script>

<style scoped>
.editor-attachment-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
</style>
