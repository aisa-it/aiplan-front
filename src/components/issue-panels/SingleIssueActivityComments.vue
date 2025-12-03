<template>
  <div
    v-if="issueCommentsData"
    class="column flex q-pb-sm full-height no-wrap"
    :class="[{ 'bg-activities': issueCommentsData.comments.length }]"
    @keyup.ctrl.enter="createComment"
  >
    <div v-if="!issueCommentsData.comments.length" class="q-mt-lg q-mb-md">
      <span class="body-1 header-title-text q-px-sm"
        >Для этой задачи еще нет комментариев</span
      >
    </div>

    <div
      ref="editorRef"
      v-if="hasPermission('add-comment')"
      class="flex flex-col no-wrap q-mt-sm full-width q-px-sm"
    >
      <ReplyCard
        v-if="isReplyComment"
        :reply-comment="issueReplyComment"
        :prevent-class="preventClickClass"
        is-not-message
        :members="localProjectMembers"
        @delete-reply="clearReply"
      />
      <EditorTipTapV2
        v-if="isVisibleEditor"
        v-model="editorValue"
        :can-edit="!loading"
        :loading="loading"
        editor-id="comments-editor-tip"
        class="comments-editor bg-base"
        editor-placeholder="Введите комментарий"
        :class-prevent="isAutoSave ? preventClickClass : ''"
        is-mention
        :members="localProjectMembers"
        :get-members-for-mention="getProjectMembersForMention"
        @get-editor="getEditor"
        @keyup.ctrl.enter="createComment"
        @updateEditorDOM="updateEditorDOM"
        isFullScreenView
        @toggle-fullscreen="
          () => {
            editorValueDialog = editorValue;
            toggleFullScreen();
          }
        "
        v-click-outside:prevent-click-comments-create="{
          isAutoSave: isAutoSave && !isFullscreen,
          onClickOutside: handleAutoSave,
        }"
      />
      <div
        v-if="
          hasPermissionByIssue(
            issueData,
            issueData.project_detail ?? project,
            'add-comment',
          )
        "
        class="q-my-sm"
      >
        <q-btn
          v-if="!isVisibleEditor"
          class="secondary-btn"
          no-caps
          @click.prevent.stop="handleVisibleEditor"
        >
          Добавить комментарий
        </q-btn>
        <div class="flex gap-x-4 justify-end" v-if="isVisibleEditor">
          <q-btn
            class="secondary-btn"
            :class="isAutoSave ? preventClickClass : ''"
            no-caps
            @click.prevent.stop="handleVisibleEditor"
          >
            Отмена
          </q-btn>
          <q-btn
            :disable="isEmpty"
            v-if="!isSendComment"
            class="primary-btn"
            :class="isAutoSave ? preventClickClass : ''"
            no-caps
            @click.prevent.stop="createComment"
          >
            Добавить
          </q-btn>
        </div>
      </div>
    </div>

    <SingleIssueActivityCommentsList
      v-if="issueCommentsData.comments.length && localProjectMembers.length"
      class="q-mt-sm"
      :comments="issueCommentsData.comments"
      :members="localProjectMembers"
      :workspaceSlug="currentWorkspaceSlug"
      :get-members-for-mention="getProjectMembersForMention"
      @refresh="resetAndRefresh"
      @handle-reply="handleReplyComment"
    />
    <q-btn
      v-if="issueCommentsData.limit < issueCommentsData.count"
      outline
      color="primary"
      class="secondary-btn self-center"
      no-caps
      @click="handleRefresh"
    >
      Загрузить ещё
    </q-btn>
  </div>
  <q-dialog
    :model-value="isFullscreen"
    @update:model-value.self="toggleFullScreen"
  >
    <q-card
      class="fullscreen-dialog row"
      :class="[isMobile ? 'q-pr-xs' : 'q-pa-xs']"
    >
      <EditorTipTapV2
        :model-value="editorValueDialog"
        @update:model-value="
          (content) => {
            editorValue = content;
          }
        "
        editor-id="comments-editor-dialog"
        editor-placeholder="Введите комментарий"
        style="border: none; height: 100%"
        is-mention
        :members="localProjectMembers"
        :get-members-for-mention="getProjectMembersForMention"
        @toggle-fullscreen="toggleFullScreen"
        isFullScreen
        isFullScreenView
      />
    </q-card>
  </q-dialog>
  <CommentShowDialog
    v-model="isShowComment"
    :info="singleCommentInfo"
    :comment="singleComment"
    :members="projectMembers"
    :getMembersForMentionFunc="getProjectMembersForMention"
    @clear="clearLink"
  />
</template>

<script setup lang="ts">
// core
import { useQuasar, Screen, EventBus } from 'quasar';
import { storeToRefs } from 'pinia';
import { Editor } from '@tiptap/vue-3';
import { onBeforeRouteLeave, useRoute, useRouter } from 'vue-router';
import {
  computed,
  nextTick,
  onMounted,
  onBeforeUnmount,
  ref,
  watch,
  inject,
  onUnmounted,
} from 'vue';

// store
import { useUserStore } from 'stores/user-store';
import { useRolesStore } from 'stores/roles-store';
import { useProjectStore } from 'stores/project-store';
import { useWorkspaceStore } from 'stores/workspace-store';
import { useSingleIssueStore } from 'stores/single-issue-store';
import { useNotificationStore } from 'stores/notification-store';
import { useAiDocStore } from 'src/stores/aidoc-store';

// utils
import { handleEditorValue } from 'src/components/editorV2/utils/tiptap';
import { setIntervalFunction } from 'src/utils/helpers';

// components
import EditorTipTapV2 from '../editorV2/EditorTipTapV2.vue';
import ReplyCard from 'components/issue-panels/reply/ReplyCard.vue';
import SingleIssueActivityCommentsList from './SingleIssueActivityCommentsList.vue';

// constants
import {
  ERROR_COMMENT_NOT_FOUND,
  SUCCESS_COMMENT_CREATING,
} from 'src/constants/notifications';

// directives
import ClickOutside from 'src/directives/click-outside';
import CommentShowDialog from '../dialogs/IssueDialogs/CommentShowDialog.vue';
import { issueSingleComment } from 'src/modules/single-issue/services/api';
import { DtoIssueComment } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { IDatasetComment } from 'src/interfaces/dataset';
import { isEditorEmpty } from '../editorV2/utils/editorUtils';

const emits = defineEmits<{
  updateComponent: [];
}>();

const bus = inject('bus') as EventBus;

defineOptions({
  directives: {
    ClickOutside,
  },
});

const route = useRoute();
const router = useRouter();
// stores
const userStore = useUserStore();
const projectStore = useProjectStore();
const workspaceStore = useWorkspaceStore();
const singleIssueStore = useSingleIssueStore();
const { setNotificationView } = useNotificationStore();
const aidocStore = useAiDocStore();

// store to refs
const { user } = storeToRefs(userStore);
const { hasPermission } = useRolesStore();
const { project } = storeToRefs(projectStore);
const { currentProjectID, projectMembers } = storeToRefs(projectStore);
const { issueCommentsData, issueData, currentIssueID } =
  storeToRefs(singleIssueStore);
const { currentWorkspaceSlug } = storeToRefs(workspaceStore);
const { hasPermissionByIssue } = useRolesStore();

// vars
const q = useQuasar();
const page = ref(1);
const editor = ref<Editor>();
const pageSize = ref(25);
const defaultPageSize = 100;
const editorRef = ref();
const msgsCycle = ref();
const editorValue = ref();
const editorValueDialog = ref();
const loading = ref<boolean>(false);
const editorDOMvalue = ref();
const isSendComment = ref(false);
const isVisibleEditor = ref(false);
const isReplyComment = ref<boolean>(false);
const issueReplyComment = ref<any>({});
const preventClickClass = 'prevent-click-comments-create';
const isFullscreen = ref(false);
const isAfterFullscreen = ref(false);
const isShowComment = ref(false);
const isAutoSave = computed(() => user.value?.view_props?.autoSave);
const localProjectMembers = ref<Array<any>>(projectMembers.value);
const isMobile = computed(() => {
  return q.platform.is.mobile && Screen.lt.md;
});
const isEmpty = computed(() => isEditorEmpty(editorDOMvalue.value));
const singleComment = ref<DtoIssueComment>();
const singleCommentInfo = ref<IDatasetComment>();

// function
const refresh = async () => {
  await singleIssueStore.issueCommentsList(page.value, pageSize.value);
  emits('updateComponent');
};

const setIntervalRefresh = () => {
  msgsCycle.value = setIntervalFunction(refresh);
};

const createComment = async () => {
  if (isEmpty.value) return;

  const comment = await handleEditorValue(editorValue.value);

  if (isSendComment.value === true) return;
  loading.value = true;
  isSendComment.value = true;
  const editorText = editor.value.getText();

  if (!isReplyComment.value) {
    await singleIssueStore
      .issueCommentCreate(comment, editorText)
      .then(() => {
        onSuccess();
      })
      .catch(() => {
        onError();
      });
  } else {
    await singleIssueStore
      .issueCommentCreateReply(
        currentWorkspaceSlug.value,
        issueReplyComment.value.project_id,
        issueReplyComment.value.issue_id,
        comment,
        editorText,
        issueReplyComment.value.id,
      )
      .then(() => {
        onSuccess();
      })
      .catch(() => {
        onError();
      });
  }
};

function onSuccess() {
  refresh();
  clearEditor();
  setNotificationView({
    open: true,
    type: 'success',
    customMessage: SUCCESS_COMMENT_CREATING,
  });

  isVisibleEditor.value = false;
  isSendComment.value = false;
  loading.value = false;
  isReplyComment.value = false;
}

function onError() {
  loading.value = false;
  isSendComment.value = false;
}

const clearEditor = () => {
  editorValue.value = '';
  issueReplyComment.value = {};
  isEditorEmpty.value = true;
};

const clearReply = () => {
  isReplyComment.value = false;
  issueReplyComment.value = {};
};

const getEditor = (edit: Editor) => {
  editor.value = edit;
  nextTick(() => {
    editorRef.value.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
    });
  });
};

const updateEditorDOM = (value: boolean) => {
  editorDOMvalue.value = value;
};

const handleVisibleEditor = () => {
  isReplyComment.value = false;
  issueReplyComment.value = {};
  isVisibleEditor.value = !isVisibleEditor.value;
  clearEditor();
};

const getMembers = async () => {
  await projectStore
    .getProjectMembers(
      currentWorkspaceSlug.value as string,
      issueData.value.project ?? currentProjectID.value,
    )
    .then((data) => {
      localProjectMembers.value = data.result || [];
    });
};

const getProjectMembersForMention = async (
  search: string,
): Promise<Array<any> | void> => {
  return await projectStore.getProjectMembersForMention(
    issueData.value,
    currentWorkspaceSlug.value || '',
    issueData.value.project ?? currentProjectID.value,
    { offset: 0, limit: 4, search_query: search },
  );
};

const resetAndRefresh = () => {
  clearInterval(msgsCycle.value);
  refresh();
  setIntervalRefresh();
};

const handleRefresh = () => {
  if (
    issueCommentsData.value.pageCount !== 1 ||
    issueCommentsData.value.limit < issueCommentsData.value.count
  ) {
    pageSize.value += defaultPageSize;
    resetAndRefresh();
  }
};

const handleAutoSave = async () => {
  if (isAutoSave.value && isVisibleEditor.value && !isFullscreen.value) {
    if (isAfterFullscreen.value) {
      isAfterFullscreen.value = false;
      return;
    }
    await createComment();
  }
};

const handleReplyComment = (comment: any) => {
  isVisibleEditor.value = true;
  isReplyComment.value = true;
  issueReplyComment.value = comment;
};

const toggleFullScreen = () => {
  if (isFullscreen.value) {
    isAfterFullscreen.value = true;
    if (editor.value?.commands?.focus) {
      editor.value.commands.focus('end');
    }
  }
  isFullscreen.value = !isFullscreen.value;
};

// hook
onBeforeRouteLeave(async (to, from, next) => {
  if (
    isAutoSave.value &&
    isVisibleEditor.value &&
    editor.value?.getText()?.trim().length
  ) {
    await handleAutoSave();
    next();
  } else {
    next();
  }
});

const handleAddListener = () => {
  window.addEventListener('beforeunload', (e) => {
    if (
      isAutoSave.value &&
      isVisibleEditor.value &&
      editor.value?.getText().trim().length
    ) {
      e.preventDefault();
      e.returnValue = '';
    }
  });
};

const handleRemoveListener = () => {
  window.removeEventListener('beforeunload', (e) => {
    if (
      isAutoSave.value &&
      isVisibleEditor.value &&
      editor.value?.getText().trim().length
    ) {
      e.preventDefault();
      e.returnValue = '';
    }
  });
};

const clearLink = () => {
  singleComment.value = undefined;
  singleCommentInfo.value = undefined;
  if (!route.params.commentId) return;
  const { project, issue } = route.params;
  router.replace({ name: 'issue', params: { project, issue } });
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
  await getMembers();
  resetAndRefresh();
  handleAddListener();
  if (route.params.commentId) {
    const data = {
      type: 'issue',
      slug: currentWorkspaceSlug.value,
      projectIdentifier: issueData.value.project ?? currentProjectID.value,
      currentIssueId: currentIssueID.value,
      commentId: route.params.commentId,
    };
    getSingleComment(data);
  }
  bus.on('openSingleComment', getSingleComment);
});

onUnmounted(() => {
  bus.off('openSingleComment', getSingleComment);
});

onBeforeUnmount(() => {
  clearInterval(msgsCycle.value);
  handleRemoveListener();
});

watch(
  () => q.appVisible,
  (isVisible) => {
    if (!isVisible) {
      clearInterval(msgsCycle.value);
    } else {
      resetAndRefresh();
    }
  },
);

watch(
  () => isVisibleEditor.value,
  () => emits('updateComponent'),
);

watch(
  () => isReplyComment.value,
  () => emits('updateComponent'),
);
</script>

<style lang="scss">
.comments-btn {
  margin-left: 0;
}

.images-preview-wrapper {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  /* Для вертикального расположения */
  width: 100%;
  min-height: 200px;
  overflow-y: auto;
  /* Вертикальный скролл */
  overflow-x: auto;
  /* Горизонтальный скролл при необходимости */
  gap: 10px;
  /* Отступ между элементами */
}

.image-preview {
  width: 100%;
  /* Каждый элемент занимает всю доступную ширину */
  display: flex;
  flex-direction: column;
  align-items: center;
  /* Центрируем содержимое по ширине */
}

.image-container {
  position: relative; // Теперь управление позиционированием внутри контейнера
  width: 100%; // или другой фиксированный размер, если нужно
  margin-bottom: 10px; // Добавляем отступы между элементами
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
</style>
