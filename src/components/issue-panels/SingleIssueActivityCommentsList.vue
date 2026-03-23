<template>
  <div class="full-w comments-list">
    <SingleIssueActivityCommentsListItem
      v-for="comment in getComments(comments)"
      :key="comment.id"
      :comment="comment"
      :members="members"
      @handle-delete="deleteComment(comment)"
      @handle-edit="editComment(comment)"
      @handle-reply="handleReply(comment)"
      @handle-history="openCommentHistory(comment)"
      @add-reaction="handleAddReaction(comment, $event)"
      @delete-reaction="handleDeleteReaction(comment, $event)"
    />
    <IssueCommentEditDialog
      v-model="isOpenCommentEditDialog"
      :comment="issueComment"
      :members="members"
      :get-members-for-mention="getMembersForMention"
      :is-auto-save="isAutoSave"
      @on-save="handleUpdateComment"
    />
    <IssueCommentDeleteDialog
      v-model="isOpenCommentDeleteDialog"
      :comment="issueComment"
      @on-delete="handleDeleteComment"
    />
    <CommentHistoryDialog
      v-model="isOpenCommentHistoryDialog"
      :comment="issueComment"
      :members="members"
      :context="'issue'"
    />
  </div>
</template>

<script setup lang="ts">
// core
import { storeToRefs } from 'pinia';
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';

// store
import { useUserStore } from 'stores/user-store';
import { useSingleIssueStore } from 'stores/single-issue-store';
import { useNotificationStore } from 'stores/notification-store';

// utils
import { handleEditorValue } from 'src/components/editorV2/utils/tiptap';

// components
import IssueCommentEditDialog from '../dialogs/IssueDialogs/IssueCommentEditDialog.vue';
import IssueCommentDeleteDialog from '../dialogs/IssueDialogs/IssueCommentDeleteDialog.vue';
import SingleIssueActivityCommentsListItem from './SingleIssueActivityCommentsListItem.vue';
import CommentHistoryDialog from '../dialogs/CommentHistoryDialog.vue';

// constants
import {
  SUCCESS_COMMENT_DELETING,
  SUCCESS_COMMENT_EDITING,
} from 'src/constants/notifications';

// interfaces
import { IIssueCommentUpdate } from 'src/interfaces/issues';
import {
  DtoIssueComment,
  DtoProjectMember,
  DtoProjectMemberLight,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';

const props = defineProps<{
  comments: DtoIssueComment[];
  members: DtoProjectMember[] | DtoProjectMemberLight[];
  workspaceSlug: string;
  getMembersForMention: (
    search: string,
  ) => Promise<DtoProjectMember[] | DtoProjectMemberLight[] | void>;
}>();

const emits = defineEmits<{
  refresh: [];
  'handle-reply': [comment: DtoIssueComment];
}>();

// store
const userStore = useUserStore();
const singleIssueStore = useSingleIssueStore();
const { setNotificationView } = useNotificationStore();
// store to vars
const { user } = storeToRefs(userStore);

// vars
const isMounted = ref<boolean>(true);
const issueComment = ref<DtoIssueComment | {}>({});
const isOpenCommentEditDialog = ref<boolean>(false);
const isOpenCommentDeleteDialog = ref<boolean>(false);
const isOpenCommentHistoryDialog = ref<boolean>(false);

const isAutoSave = computed<boolean>(() => {
  return !!user.value?.view_props?.autoSave;
});

// function
const editComment = (comment: DtoIssueComment) => {
  issueComment.value = {};
  issueComment.value = comment;
  isOpenCommentEditDialog.value = true;
};

const deleteComment = (comment: DtoIssueComment) => {
  issueComment.value = {};
  issueComment.value = comment;
  isOpenCommentDeleteDialog.value = true;
};

const openCommentHistory = (comment: DtoIssueComment) => {
  issueComment.value = {};
  issueComment.value = comment;
  isOpenCommentHistoryDialog.value = true;
};

const handleUpdateComment = async (data: IIssueCommentUpdate) => {
  const content = await handleEditorValue(data.content);
  isOpenCommentEditDialog.value = false;

  return await singleIssueStore
    .issueCommentUpdate(
      props.workspaceSlug,
      issueComment.value.project_id,
      issueComment.value.issue_id,
      issueComment.value.id,
      content,
      data.text,
      issueComment.value.reply_to_comment_id,
    )
    .then(() => emits('refresh'))
    .then(() =>
      setNotificationView({
        type: 'success',
        open: true,
        customMessage: SUCCESS_COMMENT_EDITING,
      }),
    );
};

const handleDeleteComment = async () => {
  await singleIssueStore
    .issueCommentDelete(
      issueComment.value.id,
      singleIssueStore.issueData?.project,
    )
    .then(() => {
      emits('refresh');
    })
    .then(() =>
      setNotificationView({
        type: 'success',
        open: true,
        customMessage: SUCCESS_COMMENT_DELETING,
      }),
    );
};

const handleAddReaction = async (
  comment: DtoIssueComment,
  reaction: string,
) => {
  await singleIssueStore
    .issueCommentAddReaction(
      props.workspaceSlug,
      comment.project_id as string,
      comment.issue_id as string,
      comment.id as string,
      reaction,
    )
    .then(() => {
      emits('refresh');
    });
};

const handleDeleteReaction = async (
  comment: DtoIssueComment,
  reactionValue: string,
) => {
  await singleIssueStore
    .issueCommentDeleteReaction(
      props.workspaceSlug,
      comment.project_id as string,
      comment.issue_id as string,
      comment.id as string,
      reactionValue,
    )
    .then(() => {
      emits('refresh');
    });
};

const getComments = (comments: DtoIssueComment[]): DtoIssueComment[] => {
  let list = comments;
  if (isMounted.value && comments.length > 10) {
    list = list.slice(0, 10);
  }

  return list;
};

const handleReply = (comment: DtoIssueComment) => {
  emits('handle-reply', comment);
};

const handleAddListener = () => {
  window.addEventListener('beforeunload', (e) => {
    if (isAutoSave.value && isOpenCommentEditDialog.value) {
      e.preventDefault();
      e.returnValue = '';
    }
  });
};

const handleRemoveListener = () => {
  window.removeEventListener('beforeunload', (e) => {
    if (isAutoSave.value && isOpenCommentEditDialog.value) {
      e.preventDefault();
      e.returnValue = '';
    }
  });
};

// hooks
onMounted(() => {
  handleAddListener();
});

onBeforeUnmount(() => {
  handleRemoveListener();
});

watch(
  () => props.comments,
  () => {
    isMounted.value = false;
  },
);
</script>

<style lang="scss" scoped>
.comments {
  padding: 0 0 0 5px;
}
</style>
