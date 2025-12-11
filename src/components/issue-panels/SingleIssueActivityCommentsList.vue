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

// constants
import {
  SUCCESS_COMMENT_DELETING,
  SUCCESS_COMMENT_EDITING,
} from 'src/constants/notifications';

// interfaces
import { IIssueCommentUpdate } from 'src/interfaces/issues';

const props = defineProps<{
  comments: any[];
  members: any[];
  workspaceSlug: string;
  getMembersForMention: (search: string) => Promise<any[] | void>;
}>();

const emits = defineEmits<{
  refresh: [];
  'handle-reply': [comment: any];
}>();

// store
const userStore = useUserStore();
const singleIssueStore = useSingleIssueStore();
const { setNotificationView } = useNotificationStore();
// store to vars
const { user } = storeToRefs(userStore);

// vars
const isMounted = ref<boolean>(true);
const issueComment = ref<any>({});
const isOpenCommentEditDialog = ref<boolean>(false);
const isOpenCommentDeleteDialog = ref<boolean>(false);

const isAutoSave = computed(() => {
  return !!user.value?.view_props?.autoSave;
});

// function
const editComment = (comment: any) => {
  issueComment.value = {};
  issueComment.value = comment;
  isOpenCommentEditDialog.value = true;
};

const deleteComment = (comment: any) => {
  issueComment.value = {};
  issueComment.value = comment;
  isOpenCommentDeleteDialog.value = true;
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

const handleAddReaction = async (comment: any, reaction: string) => {
  await singleIssueStore
    .issueCommentAddReaction(
      props.workspaceSlug,
      comment.project_id,
      comment.issue_id,
      comment.id,
      reaction,
    )
    .then(() => {
      emits('refresh');
    });
};

const handleDeleteReaction = async (comment: any, reactionValue: string) => {
  await singleIssueStore
    .issueCommentDeleteReaction(
      props.workspaceSlug,
      comment.project_id,
      comment.issue_id,
      comment.id,
      reactionValue,
    )
    .then(() => {
      emits('refresh');
    });
};

const getComments = (comments: Array<any>) => {
  let list = comments;
  if (isMounted.value && comments.length > 10) {
    list = list.slice(0, 10);
  }

  return list;
};

const handleReply = (comment: any) => {
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
