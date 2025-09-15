<template>
  <CommentMainBlock
    :comments-list="commentsList"
    :currentWorkspaceSlug="currentWorkspaceSlug"
    :doc-id="route.params.doc"
    :is-auto-save="isAutoSave"
    :loading="loading"
    :members="workspaceUsers"
    :get-members-for-mention="getWorkspaceMembersForMention"
    @create-comment="createComment"
    @update-comment="updateComment"
    @delete-commit="deleteComment"
    @refresh="refreshList"
  />
  <CommentShowDialog
    v-model="isShowComment"
    :info="singleCommentInfo"
    :comment="singleComment"
    :members="workspaceUsers"
    hasPermision
    :getMembersForMentionFunc="getWorkspaceMembersForMention"
    @clear="clearLink"
  />
</template>

<script lang="ts" setup>
// core //
import { EventBus } from 'quasar';
import { computed, inject, onMounted, onUnmounted, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useRoute, useRouter } from 'vue-router';

// store
import { useUserStore } from 'stores/user-store';
import { useAiDocStore } from 'src/stores/aidoc-store';
import { useWorkspaceStore } from 'src/stores/workspace-store';
import { useNotificationStore } from 'stores/notification-store';

// utils
import { handleEditorValue } from 'src/components/editorV2/utils/tiptap';

// constants
import {
  ERROR_COMMENT_NOT_FOUND,
  SUCCESS_COMMENT_CREATING,
  SUCCESS_COMMENT_DELETING,
  SUCCESS_COMMENT_EDITING,
} from 'src/constants/notifications';

// interfaces
import { IDatasetComment } from 'src/interfaces/dataset';
import {
  DtoDocComment,
  DtoIssueComment,
  DtoWorkspaceMember,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';
// components
import CommentMainBlock from '../comments-block/CommentMainBlock.vue';
import CommentShowDialog from '../dialogs/IssueDialogs/CommentShowDialog.vue';

// services
import { issueSingleComment } from 'src/modules/single-issue/services/api';

// stores
const route = useRoute();

const bus = inject('bus') as EventBus;

const router = useRouter();
const userStore = useUserStore();
const aidocStore = useAiDocStore();
const workspaceStore = useWorkspaceStore();
const { setNotificationView } = useNotificationStore();
const { user } = storeToRefs(userStore);

const { currentWorkspaceSlug, workspaceUsers } = storeToRefs(workspaceStore);

const loading = ref<boolean>(false);
const commentsList = ref([]);
const singleComment = ref<DtoIssueComment | DtoDocComment>();
const singleCommentInfo = ref<IDatasetComment>();
const isShowComment = ref(false);

const isAutoSave = computed(() => user.value?.view_props?.autoSave);

const createComment = async (data: object) => {
  const contents = await handleEditorValue(data.content);
  try {
    loading.value = true;
    await aidocStore.createComment({
      content: {
        comment: {
          comment_html: contents.html,
          reply_to_comment_id: data.reply_id,
        },
        files: contents.files,
      },
      workspaceSlug: route.params.workspace,
      id: route.params.doc,
    });
    setNotificationView({
      type: 'success',
      open: true,
      customMessage: SUCCESS_COMMENT_CREATING,
    });
  } finally {
    loading.value = false;
    refreshList();
  }
};

const updateComment = async (data: object) => {
  try {
    await aidocStore.updateComment(data);
    refreshList();
    setNotificationView({
      type: 'success',
      open: true,
      customMessage: SUCCESS_COMMENT_EDITING,
    });
  } catch (e) {}
};

const deleteComment = async (data: object) => {
  try {
    await aidocStore.deleteComment(data);
    refreshList();
    setNotificationView({
      type: 'success',
      open: true,
      customMessage: SUCCESS_COMMENT_DELETING,
    });
  } catch (e) {}
};

const refreshList = async () => {
  commentsList.value = await aidocStore.getCommentsList(
    route.params.workspace as string,
    route.params.doc as string,
  );
};

//TODO дубляж функции в компонентах CreateDocPageDialog, AiDocPage, AidocActivityComments, AidocVersionSelect
const getWorkspaceMembersForMention = async (
  search: string,
): Promise<DtoWorkspaceMember[] | undefined> => {
  const arr = await workspaceStore.getWorkspaceMembers(
    route.params.workspace as string,
    { offset: 0, limit: 4, order_by: 'id', desc: false, search_query: search },
  );
  return arr?.result;
};

const clearLink = () => {
  singleComment.value = undefined;
  singleCommentInfo.value = undefined;
  if (!route.params.commentId) return;
  const { doc } = route.params;
  router.replace({ name: 'doc', params: { doc } });
};

const getSingleComment = async (data: any) => {
  try {
    let res;
    if (data.type === 'issue') {
      res = await issueSingleComment(
        data.slug,
        data.projectIdentifier,
        data.currentIssueId,
        data.commentId,
      );
    }
    if (data.type === 'aidoc') {
      res = await aidocStore.getSingleComment(
        data.slug,
        data.docId,
        data.commentId,
      );
    }
    singleCommentInfo.value = data;
    singleComment.value = res;
    isShowComment.value = true;
  } catch (err) {
    if (err.status === 404) {
      if (data.originalUrl) {
        window.open(data.originalUrl, '_blank');
      } else {
        setNotificationView({
          open: true,
          type: 'error',
          customMessage: ERROR_COMMENT_NOT_FOUND,
        });
      }
    }
    clearLink();
  }
};

onMounted(async () => {
  refreshList();
  if (route.params.commentId) {
    const data = {
      type: 'aidoc',
      slug: route.params.workspace?.toString(),
      docId: route.params.doc?.toString(),
      commentId: route.params.commentId,
    };
    getSingleComment(data);
  }
  bus.on('openSingleComment', getSingleComment);
});

onUnmounted(() => {
  bus.off('openSingleComment', getSingleComment);
});
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
