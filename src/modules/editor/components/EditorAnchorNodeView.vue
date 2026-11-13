<template>
  <NodeViewWrapper
    as="span"
    class="editor-doc-anchor"
    :data-anchor-id="node.attrs.anchorId"
    :data-anchor-title="node.attrs.title"
  >
    <v-menu v-if="!readonly" v-model="open" :close-on-content-click="false">
      <template #activator="{ props: menuProps }">
        <span v-bind="menuProps" class="editor-doc-anchor__chip" contenteditable="false">
          <v-icon icon="mdi-bookmark" size="14" />
          <span class="editor-doc-anchor__label">{{ label }}</span>
        </span>
      </template>
      <v-card min-width="260" class="editor-doc-anchor__menu" @click.stop>
        <form @submit.prevent="renameAnchor">
          <v-text-field v-model="draftTitle" :label="t('editor.anchorName')" density="compact" color="text" hide-details="auto" autofocus />
          <div class="d-flex justify-end ga-1 mt-2">
            <v-btn type="submit" color="primary" variant="flat" class="editor-doc-anchor__rename" :disabled="!draftTitle.trim()">{{ t('editor.rename') }}</v-btn>
          </div>
        </form>
        <v-divider class="my-2" />
        <div class="d-flex flex-column align-start">
          <v-btn v-if="canCopyLink" prepend-icon="mdi-link-variant" color="text" variant="text" class="editor-doc-anchor__menu-item" @click="copyLink">{{ t('editor.copyLink') }}</v-btn>
          <v-btn prepend-icon="mdi-delete" color="text" variant="text" class="editor-doc-anchor__menu-item" @click="deleteNode(); open = false">{{ t('editor.delete') }}</v-btn>
        </div>
        <div v-if="copyError" role="alert" class="text-error text-caption pa-1">{{ t('editor.couldNotCopyLink') }}</div>
      </v-card>
    </v-menu>
  </NodeViewWrapper>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import { computed, inject, ref, watch } from 'vue';
import { NodeViewWrapper, nodeViewProps } from '@tiptap/vue-3';

import { EDITOR_ANCHOR_CONTEXT_KEY, EDITOR_READONLY_KEY, type EditorAnchorContext } from '../model/editor.injection';

const { t } = useI18n();

const props = defineProps(nodeViewProps);
const readonly = inject(EDITOR_READONLY_KEY, computed(() => !props.editor.isEditable));
const anchorContext = inject(EDITOR_ANCHOR_CONTEXT_KEY, computed<EditorAnchorContext>(() => ({})));
const open = ref(false);
const draftTitle = ref('');
const copyError = ref(false);
const label = computed(() => props.node.attrs.title || props.node.attrs.anchorId || t('editor.anchor'));
const canCopyLink = computed(() => Boolean(
  anchorContext.value.workspaceSlug && anchorContext.value.documentSlug && props.node.attrs.anchorId,
));

watch(open, (value) => {
  if (value) {
    draftTitle.value = props.node.attrs.title || '';
    copyError.value = false;
  }
});

const renameAnchor = () => {
  const title = draftTitle.value.trim();
  if (!title) return;
  props.updateAttributes({ title });
  open.value = false;
};

const copyLink = async () => {
  const { workspaceSlug, documentSlug } = anchorContext.value;
  if (!workspaceSlug || !documentSlug || !props.node.attrs.anchorId) return;
  const path = `/${encodeURIComponent(workspaceSlug)}/aidoc/${encodeURIComponent(documentSlug)}`;
  const url = `${window.location.origin}${path}#${encodeURIComponent(props.node.attrs.anchorId)}`;
  try {
    await navigator.clipboard.writeText(url);
    open.value = false;
  } catch {
    copyError.value = true;
  }
};
</script>

<style scoped>
.editor-doc-anchor { display: inline; }
.editor-doc-anchor__chip {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  max-width: 200px;
  padding: 0 6px 0 4px;
  border: 1px dashed rgb(var(--v-theme-primary));
  border-radius: 10px;
  color: rgb(var(--v-theme-primary));
  font-size: 11px;
  line-height: 16px;
  cursor: pointer;
  vertical-align: baseline;
}
.editor-doc-anchor__label { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.editor-doc-anchor__menu { padding: 12px 8px 8px; border-radius: 16px; }
.editor-doc-anchor__menu :deep(.v-field-label) { color: rgb(var(--v-theme-text)); opacity: .7; }
.editor-doc-anchor__rename { width: 140px; min-width: 140px; height: 40px; border-radius: 8px; font-weight: 600; }
.editor-doc-anchor__menu-item { width: 100%; height: 36px; justify-content: flex-start; padding-inline: 8px; font-size: 14px; }
</style>
