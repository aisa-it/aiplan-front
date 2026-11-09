<template>
  <v-dialog v-model="open" max-width="700">
    <v-card class="editor-comment-preview">
      <v-card-title class="editor-comment-preview__header">
        <span>{{ contextTitle }}</span>
        <v-btn icon="mdi-close" variant="text" size="small" :aria-label="t('editor.closeComment')" @click="open = false" />
      </v-card-title>

      <v-card-text>
        <v-progress-circular v-if="loading" indeterminate size="24" width="2" />
        <p v-else-if="error" role="alert">
          {{ error }}
          <a v-if="fallbackHref" :href="fallbackHref" target="_blank" rel="noopener noreferrer">
            {{ t('editor.openOriginalLink') }}
          </a>
        </p>
        <template v-else-if="comment">
          <p class="editor-comment-preview__context">
            {{ link?.contextType === 'aidoc' ? t('editor.documentContext') : t('editor.taskContext') }}
            <a v-if="contextHref" :href="contextHref" target="_blank" rel="noopener noreferrer">
              {{ contextName }}
            </a>
            <span v-else>{{ contextName }}</span>
          </p>
          <p v-if="author" class="editor-comment-preview__meta">{{ t('editor.author', { author }) }}</p>
          <component
            :is="ReadonlyEditor"
            :model-value="comment.comment_html || ''"
            :editable="false"
            :can-edit="false"
            read-only-editor
            :workspace-slug="link?.workspaceSlug"
            class="editor-comment-preview__body"
          />
          <p v-if="createdAt || comment.updated_by_id" class="editor-comment-preview__meta">
            {{ createdAt }}
            <span v-if="comment.updated_by_id" class="editor-comment-preview__edited">
              {{ t('editor.edited') }}
              <v-tooltip v-if="updatedAt" activator="parent">{{ updatedAt }}</v-tooltip>
            </span>
          </p>
        </template>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import { computed, defineAsyncComponent, ref, watch } from 'vue';
import type { DtoDocComment, DtoIssueComment } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { formatDateTimeWithDay } from '@/utils/time';

import type { EditorSpecialLink } from '../model/editor.types';
import { resolveEditorAttachmentLink, resolveEditorCommentLink } from '../utils/editorIntegration';
import { getEditorCommentContextHref, getEditorCommentFailure } from '../utils/editorSpecialLinks';

const { t } = useI18n();

const props = defineProps<{
  modelValue: boolean;
  link?: EditorSpecialLink;
}>();
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>();
const ReadonlyEditor = defineAsyncComponent(() => import('./EditorTipTap.vue'));

const open = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});
const comment = ref<DtoDocComment | DtoIssueComment>();
const documentTitle = ref('');
const loading = ref(false);
const error = ref('');
const fallbackHref = ref<string>();

const contextTitle = computed(() =>
  props.link?.contextType === 'aidoc' ? t('editor.commentOnADocument') : t('editor.commentOnATask'),
);
const contextName = computed(() =>
  props.link?.contextType === 'aidoc'
    ? documentTitle.value || props.link.documentId || ''
    : [props.link?.projectIdentifier, props.link?.issueId].filter(Boolean).join('-'),
);
const contextHref = computed(() => getEditorCommentContextHref(props.link));
const author = computed(() => {
  const user = comment.value?.actor_detail;
  return [user?.first_name, user?.last_name].filter(Boolean).join(' ') || user?.username || '';
});
const createdAt = computed(() => comment.value?.created_at
  ? formatDateTimeWithDay(comment.value.created_at) : '');
const updatedAt = computed(() => comment.value?.updated_at
  ? formatDateTimeWithDay(comment.value.updated_at) : '');

watch(
  [() => props.modelValue, () => props.link],
  async ([visible, link], _, onCleanup) => {
    let cancelled = false;
    onCleanup(() => { cancelled = true; });
    comment.value = undefined;
    documentTitle.value = '';
    error.value = '';
    fallbackHref.value = undefined;
    if (!visible || !link) return;
    loading.value = true;
    try {
      const [result, context] = await Promise.all([
        resolveEditorCommentLink(link),
        link.contextType === 'aidoc'
          ? resolveEditorAttachmentLink(link).catch(() => undefined)
          : Promise.resolve(undefined),
      ]);
      if (!cancelled) {
        documentTitle.value = context?.sourceTitle || '';
        if (result) comment.value = result;
        else error.value = t('editor.couldNotFindTheComment');
      }
    } catch (reason) {
      if (!cancelled) {
        const failure = getEditorCommentFailure(reason, link.originalUrl);
        if (failure.notFound) {
          error.value = t('editor.commentNotFound');
          fallbackHref.value = failure.fallbackHref;
          if (fallbackHref.value) window.open(fallbackHref.value, '_blank', 'noopener,noreferrer');
        } else {
          error.value = t('editor.couldNotLoadTheComment');
        }
      }
    } finally {
      if (!cancelled) loading.value = false;
    }
  },
  { immediate: true },
);
</script>

<style scoped>
.editor-comment-preview__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 600;
}

.editor-comment-preview__context,
.editor-comment-preview__meta {
  margin-bottom: 8px;
  color: rgb(var(--v-theme-text));
  font-size: 13px;
}

.editor-comment-preview__body {
  margin: 12px 0;
}

.editor-comment-preview__edited {
  margin-left: 6px;
}
</style>
