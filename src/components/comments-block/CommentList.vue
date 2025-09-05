<template>
  <q-list class="q-mt-sm full-w comments">
    <div class="full-w comments-list">
      <CommentListItem
        v-for="comment in comments"
        :key="comment.id"
        :comment="comment"
        :members="members"
        :get-members-for-mention="getMembersForMention"
        :copy-func="aidocStore.copyComment"
        @handle-delete="changeCommit(comment, 'delete')"
        @handle-edit="changeCommit(comment, 'edit')"
        @handle-reply="handleReply(comment)"
        @add-reaction="handleAddReaction(comment, $event)"
        @delete-reaction="handleDeleteReaction(comment, $event)"
      />
    </div>
    <CommentEditDialog
      v-model="isOpenCommentEditDialog"
      :comment="currentCommitUsage"
      :members="members"
      :get-members-for-mention="getMembersForMention"
      :is-auto-save="isAutoSave"
      @on-save="handleUpdateComment"
    />
    <CommentDeleteDialog
      v-model="isOpenCommentDeleteDialog"
      :comment="currentCommitUsage"
      @on-delete="handleDeleteComment()"
    />
  </q-list>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import CommentEditDialog from './dialogs/CommentEditDialog.vue';
import CommentDeleteDialog from './dialogs/CommentDeleteDialog.vue';
import CommentListItem from './items/CommentListItem.vue';
import { handleEditorValue } from 'src/components/editorV2/utils/tiptap';
import { useAiDocStore } from 'src/stores/aidoc-store';

const props = defineProps({
  comments: { type: Array, required: true },
  docId: { type: String, required: true },
  members: { type: Array, required: false },
  workspaceSlug: { type: String, required: true },
  getMembersForMention: { type: Function, required: false },
  isAutoSave: { type: Boolean, required: true },
});

const emit = defineEmits([
  'refresh',
  'handle-reply',
  'updateCommit',
  'deleteCommit',
]);

const aidocStore = useAiDocStore();

const isOpenCommentEditDialog = ref(false);
const isOpenCommentDeleteDialog = ref(false);
const currentChangeCommitId = ref();
const currentCommitUsage = ref({});

const changeCommit = (comment: object, type: string) => {
  currentCommitUsage.value = comment;
  currentChangeCommitId.value = comment.id;
  if (type === 'edit') isOpenCommentEditDialog.value = true;
  else isOpenCommentDeleteDialog.value = true;
};

const handleUpdateComment = async (data: object) => {
  const contents = await handleEditorValue(data.content);
  const updateBody = {
    workspaceSlug: props.workspaceSlug,
    docId: props.docId,
    commentId: currentChangeCommitId.value,
    data: {
      comment: {
        comment_html: contents.html,
        reply_to_comment_id: currentCommitUsage.value?.original_comment?.id
          ? currentCommitUsage.value?.original_comment?.id
          : null,
      },
      files: contents.files,
    },
  };
  emit('updateCommit', updateBody);
};

const handleDeleteComment = async () => {
  const deleteBody = {
    workspaceSlug: props.workspaceSlug,
    docId: props.docId,
    commentId: currentChangeCommitId.value,
  };
  emit('deleteCommit', deleteBody);
};

const handleAddReaction = async (comment: any, reaction: string) => {
  await aidocStore
    .addReaction(props.workspaceSlug, props.docId, comment.id, { reaction })
    .then(() => {
      emit('refresh');
    });
};

const handleDeleteReaction = async (comment: any, reaction: string) => {
  await aidocStore
    .deleteReaction(props.workspaceSlug, props.docId, comment.id, reaction)
    .then(() => {
      emit('refresh');
    });
};

const handleReply = (comment: any) => emit('handle-reply', comment);
</script>

<style lang="scss" scoped>
.comments {
  padding: 0 0 0 5px;
  background: inherit !important;
}

.comments-list {
  max-height: 654px;
  overflow-y: auto;
  overflow-x: hidden;
}
</style>
