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
        @handle-history="openCommentHistory(comment)"
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
    <CommentHistoryDialog
      v-model="isOpenCommentHistoryDialog"
      :comment="currentCommitUsage"
      :members="members"
      :context="'doc'"
    />
  </q-list>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import CommentEditDialog from './dialogs/CommentEditDialog.vue';
import CommentDeleteDialog from './dialogs/CommentDeleteDialog.vue';
import CommentHistoryDialog from '../dialogs/CommentHistoryDialog.vue';
import CommentListItem from './items/CommentListItem.vue';
import { handleEditorValue } from 'src/components/editorV2/utils/tiptap';
import { useAiDocStore } from 'src/stores/aidoc-store';
import { DtoDocComment } from '@aisa-it/aiplan-api-ts/src/data-contracts';

const props = defineProps<{
  comments: DtoDocComment[];
  docId: string;
  members?: any[];
  workspaceSlug: string;
  getMembersForMention?: (data: any) => any;
  isAutoSave: boolean;
}>();

export interface updateBodyType {
  workspaceSlug: string;
  docId: string;
  commentId: any;
  data: {
    comment: {
      comment_html: string | null | undefined;
      reply_to_comment_id: any;
    };
    files: File[] | never[];
  };
}

const emits = defineEmits<{
  refresh: [];
  'handle-reply': [DtoDocComment];
  updateCommit: [updateBodyType];
  deleteCommit: [{ workspaceSlug: string; docId: string; commentId: string }];
}>();

const aidocStore = useAiDocStore();

const isOpenCommentEditDialog = ref<boolean>(false);
const isOpenCommentDeleteDialog = ref<boolean>(false);
const isOpenCommentHistoryDialog = ref<boolean>(false);
const currentChangeCommitId = ref();
const currentCommitUsage = ref({});

const changeCommit = (comment: DtoDocComment, type: string) => {
  currentCommitUsage.value = comment;
  currentChangeCommitId.value = comment.id;
  if (type === 'edit') isOpenCommentEditDialog.value = true;
  else isOpenCommentDeleteDialog.value = true;
};

const handleUpdateComment = async (data: { content: string; text: string }) => {
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
  emits('updateCommit', updateBody);
};

const handleDeleteComment = async () => {
  const deleteBody = {
    workspaceSlug: props.workspaceSlug,
    docId: props.docId,
    commentId: currentChangeCommitId.value,
  };
  emits('deleteCommit', deleteBody);
};

const openCommentHistory = (comment: DtoDocComment) => {
  currentCommitUsage.value = comment;
  isOpenCommentHistoryDialog.value = true;
};

const handleAddReaction = async (comment: DtoDocComment, reaction: string) => {
  await aidocStore
    .addReaction(props.workspaceSlug, props.docId, comment.id as string, {
      reaction,
    })
    .then(() => {
      emits('refresh');
    });
};

const handleDeleteReaction = async (
  comment: DtoDocComment,
  reaction: string,
) => {
  await aidocStore
    .deleteReaction(
      props.workspaceSlug,
      props.docId,
      comment.id as string,
      reaction,
    )
    .then(() => {
      emits('refresh');
    });
};

const handleReply = (comment: DtoDocComment) => emits('handle-reply', comment);
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
