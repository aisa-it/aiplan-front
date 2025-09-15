<template>
  <div
    class="flex column full-height no-wrap"
    :class="[{ 'bg-activities': commentsList.length }]"
    style="width: 100%"
  >
    <div>
      <div v-if="!commentsList.length" class="body-1 text-dark q-mt-lg q-px-sm">
        Для этого документа еще нет комментариев
      </div>
    </div>

    <div
      ref="editorRef"
      class="flex flex-col no-wrap q-my-sm full-width q-px-sm"
    >
      <ReplyCard
        v-if="isReplyComment"
        :reply-comment="docReplyComment"
        is-not-message
        @delete-reply="clearReply"
      />
      <EditorTipTapV2
        v-if="isVisibleEditor || loading"
        v-model="editorValue"
        :can-edit="!loading"
        :loading="loading"
        editor-id="comments-editor-tip"
        class="comments-editor bg-base"
        editor-placeholder="Введите комментарий"
        is-mention
        :members="members"
        :get-members-for-mention="getMembersForMention"
        @get-editor="getEditor"
        @updateEditorDOM="updateEditorDOM"
        isFullScreenView
        @toggle-fullscreen="
          () => {
            editorValueDialog = editorValue;
            isFullscreen = !isFullscreen;
          }
        "
      />
      <div class="q-my-sm">
        <q-btn
          v-if="!isVisibleEditor"
          class="secondary-btn"
          no-caps
          @click="handleVisibleEditor"
        >
          Добавить комментарий
        </q-btn>
        <div class="flex gap-x-4 justify-end" v-if="isVisibleEditor">
          <q-btn class="secondary-btn" no-caps @click="handleVisibleEditor">
            Отмена
          </q-btn>
          <q-btn class="primary-btn" no-caps @click="createComment">
            Добавить
          </q-btn>
        </div>
      </div>
    </div>

    <CommentList
      :comments="commentsList"
      :doc-id="docId"
      :workspaceSlug="currentWorkspaceSlug"
      :isAutoSave="isAutoSave"
      :members="members"
      :get-members-for-mention="getMembersForMention"
      @refresh="emit('refresh')"
      @update-commit="(body) => emit('updateComment', body)"
      @delete-commit="(body) => emit('deleteCommit', body)"
      @handle-reply="handleReplyComment"
    />
  </div>
  <q-dialog v-model="isFullscreen">
    <q-card class="fullscreen-dialog row q-pa-xs">
      <EditorTipTapV2
        :model-value="editorValueDialog"
        @update:model-value="
          (content) => {
            editorValue = content;
          }
        "
        editor-id="comments-editor-dialog"
        editor-placeholder="Введите комментарий"
        style="border: none; max-height: 94%"
        is-mention
        :members="members"
        :get-members-for-mention="getMembersForMention"
        @toggle-fullscreen="
          () => {
            isFullscreen = !isFullscreen;
          }
        "
        isFullScreen
        isFullScreenView
      />
    </q-card>
  </q-dialog>
</template>

<script lang="ts" setup>
// core

// store
// utils

// components
import ReplyCard from 'components/issue-panels/reply/ReplyCard.vue';
import { nextTick, ref } from 'vue';
import { Editor } from '@tiptap/vue-3';
import CommentList from './CommentList.vue';
import EditorTipTapV2 from '../editorV2/EditorTipTapV2.vue';
import { isEditorEmpty } from 'src/components/editorV2/utils/editorUtils';

// stores
defineProps({
  commentsList: { type: Array, required: true },
  docId: { type: String, required: false },
  isAutoSave: { type: Boolean, required: true },
  currentWorkspaceSlug: { type: String, required: false },
  loading: { type: Boolean, required: false },
  members: { type: Array, required: false },
  getMembersForMention: { type: Function, required: false },
});
const emit = defineEmits([
  'updateComponent',
  'createComment',
  'refresh',
  'updateComment',
  'deleteCommit',
]);
const editor = ref<Editor>();
const editorValue = ref();
const editorValueDialog = ref();
const editorRef = ref();
const editDOMvalue = ref();
const isVisibleEditor = ref(false);
const isReplyComment = ref(false);
const docReplyComment = ref();
const isFullscreen = ref(false);

const handleVisibleEditor = () => {
  isVisibleEditor.value = !isVisibleEditor.value;
  clearReply();
};

const getEditor = (value: any) => {
  editor.value = value;
  nextTick(() => {
    editorRef.value.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
    });
  });
};

const updateEditorDOM = (value: boolean) => {
  editDOMvalue.value = value;
};

const createComment = async () => {
  if (isEditorEmpty(editDOMvalue.value)) return;
  emit('createComment', {
    content: editorValue.value,
    reply_id: isReplyComment.value ? docReplyComment.value.id : null,
  });
  clearReply();
  isVisibleEditor.value = false;
  editorValue.value = '';
};

const handleReplyComment = (comment: any) => {
  isVisibleEditor.value = true;
  isReplyComment.value = true;
  docReplyComment.value = comment;
};

const clearReply = () => {
  isReplyComment.value = false;
  docReplyComment.value = {};
};
</script>

<style lang="scss">
.comments-btn {
  margin-left: 0;
}

.images-preview-wrapper {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  min-height: 200px;
  overflow-y: auto;
  overflow-x: auto;
  gap: 10px;
}

.image-preview {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.image-container {
  position: relative;
  width: 100%;
  margin-bottom: 10px;
}
</style>

<style lang="scss" scoped>
:deep(.comments-editor.html-editor) {
  .html-editor__container {
    min-height: 12.5rem;
    height: auto;
  }
  .tiptap {
    min-height: 12.5rem;
  }
}
::v-deep(.html-editor__wrapper) {
  height: 100%;
}
::v-deep(.html-editor__container) {
  height: 100%;
}
</style>
