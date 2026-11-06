<template>
  <NodeViewWrapper
    v-bind="HTMLAttributes"
    as="span"
    class="special-link-mention issue-link editor-issue-link"
    contenteditable="false"
  >
    <v-progress-circular
      v-if="loading"
      class="editor-issue-link__loader"
      indeterminate
      size="14"
      width="2"
    />

    <span v-else-if="error" class="editor-issue-link__error">{{ errorLabel }}</span>
    <template v-else>
      <span class="editor-issue-link__identifier">{{ identifier }}</span>
      <span v-if="preview?.name" class="editor-issue-link__name">
        {{ preview.name }}
      </span>
      <span
        v-if="preview?.statusName"
        class="editor-issue-link__status"
        :style="statusStyle"
      >
        {{ preview.statusName }}
      </span>
    </template>
  </NodeViewWrapper>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue';
import { NodeViewWrapper, nodeViewProps } from '@tiptap/vue-3';

import { EDITOR_SPECIAL_LINK_RESOLVERS_KEY } from '../model/editor.injection';
import { useEditorLinkPreview } from '../composables/useEditorLinkPreview';
import type {
  EditorIssueLinkPreview,
  EditorSpecialLink,
} from '../model/editor.types';

const props = defineProps(nodeViewProps);
const resolvers = inject(EDITOR_SPECIAL_LINK_RESOLVERS_KEY);

const link = computed<EditorSpecialLink>(() => ({
  kind: 'issue',
  workspaceSlug: props.node.attrs.slug,
  projectIdentifier: props.node.attrs.projectIdentifier,
  issueId: props.node.attrs.currentIssueId,
  originalUrl: props.node.attrs.originalUrl,
}));

const identifier = computed(
  () =>
    preview.value?.identifier ||
    [link.value.projectIdentifier, link.value.issueId]
      .filter(Boolean)
      .join('-') ||
    '#issue',
);

const statusStyle = computed(() => {
  const color = preview.value?.statusColor;
  if (!color) return;

  return {
    '--editor-issue-status-color': color,
  };
});

const { loading, preview, error } = useEditorLinkPreview<EditorIssueLinkPreview>(
  () => link.value,
  () => resolvers?.resolveIssueLink,
);
const errorLabel = computed(() => {
  const reason = error.value as { response?: { data?: { code?: number } } } | undefined;
  return reason?.response?.data?.code === 4001 ? 'Задача удалена' : 'Нет доступа';
});
</script>

<style scoped>
.editor-issue-link {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.editor-issue-link__loader {
  margin: 0 4px;
}

.editor-issue-link__identifier {
  text-decoration: underline;
  text-underline-offset: 2px;
}

.editor-issue-link__name {
  color: rgb(var(--v-theme-text));
  font-weight: 400;
  text-decoration: none;
}

.editor-issue-link__error {
  font-style: italic;
}

.editor-issue-link__status {
  padding: 2px 5px;
  border-radius: 4px;
  background-color: color-mix(
    in srgb,
    var(--editor-issue-status-color) 20%,
    transparent
  );
  color: var(--editor-issue-status-color);
  font-size: 11px;
  font-weight: 600;
  text-decoration: none;
}
</style>
