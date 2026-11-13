<template>
  <NodeViewWrapper as="span" class="special-link-mention comment-link"
    v-bind="dataAttributes" contenteditable="false">
    <v-menu v-model="open" :disabled="readonly" :close-on-content-click="false">
      <template #activator="{ props: menuProps }">
        <span v-bind="readonly ? {} : menuProps" :role="readonly ? undefined : 'button'"
          :tabindex="readonly ? undefined : 0">#{{ node.attrs.title || node.attrs.commentId || 'comment' }}</span>
      </template>
      <v-card class="pa-2" width="300">
        <form @submit.prevent="save">
          <v-text-field v-model="title" :label="t('editor.enterAName')" autofocus
            density="compact" hide-details variant="outlined" />
          <div class="d-flex justify-end mt-2">
            <v-btn variant="text" @click="open = false">{{ t('editor.cancel') }}</v-btn>
            <v-btn type="submit" color="primary" :disabled="!title.trim()">{{ t('editor.saveName') }}</v-btn>
          </div>
        </form>
      </v-card>
    </v-menu>
  </NodeViewWrapper>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import { computed, inject, ref, watch } from 'vue';
import { NodeViewWrapper, nodeViewProps } from '@tiptap/vue-3';
import { EDITOR_READONLY_KEY } from '../model/editor.injection';

const { t } = useI18n();

const props = defineProps(nodeViewProps);
const injectedReadonly = inject(EDITOR_READONLY_KEY);
const readonly = computed(() => injectedReadonly?.value ?? !props.editor.isEditable);
const open = ref(false);
const title = ref('');
const dataAttributes = computed(() => Object.fromEntries(Object.entries({
  'data-type': props.node.attrs.type,
  'data-slug': props.node.attrs.slug,
  'data-project-identifier': props.node.attrs.projectIdentifier,
  'data-current-issue-id': props.node.attrs.currentIssueId,
  'data-comment-id': props.node.attrs.commentId,
  'data-doc-id': props.node.attrs.docId,
  'data-original-url': props.node.attrs.originalUrl,
  'data-title': props.node.attrs.title,
}).filter(([, value]) => value != null)));
watch(open, (value) => { if (value) title.value = props.node.attrs.title || ''; });
watch(readonly, (value) => { if (value) open.value = false; });
const save = () => {
  if (readonly.value || !title.value.trim()) return;
  props.updateAttributes({ title: title.value.trim() });
  open.value = false;
};
</script>
