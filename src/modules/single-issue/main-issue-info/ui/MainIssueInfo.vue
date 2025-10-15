<template>
  <div class="q-px-sm full-width">
    <div class="flex no-wrap q-py-sm">
      <IssueNameInput :isReadonly="isReadOnlyEditor" />
      <q-btn
        v-if="isAdminOrAuthor && isReadOnlyEditor"
        dense
        flat
        class="btn-only-icon-sm readonly-title-issue__edit"
        :class="isAutoSave ? preventClickClass : ''"
        title="Нажмите для редактирования"
        @click="editTitle"
      >
        <EditIcon />
      </q-btn>
      <q-btn
        class="btn-only-icon-sm q-pa-sm issue-panel__right-drawer-open"
        flat
        @click.stop="toggleDrawer()"
      >
        <MenuIcon :width="18" :height="18" />
      </q-btn>
    </div>
    <div class="q-mb-md">
      <div class="flex items-center">
        <q-chip
          v-for="t in issueData.label_details"
          class="issue-chip q-my-xs q-ml-none q-mr-sm"
          :key="t.id"
          :ripple="false"
        >
          <q-badge
            rounded
            :style="'background-color: ' + getCorrectColor(t.color)"
            class="q-mr-sm"
          />
          <span class="abbriviated-text">
            {{ t.name }}
            <HintTooltip>
              <span class="word-wrap" style="width: 95%">
                {{ t.name }}
              </span>
            </HintTooltip>
          </span>
        </q-chip>
        <q-btn
          dense
          flat
          no-caps
          :class="[
            issueData?.label_details.length
              ? 'btn-only-icon-sm'
              : 'btn-sm issue-tags-edit-btn',
          ]"
          title="Нажмите для редактирования"
          @click="showTagsDialog = !showTagsDialog"
        >
          <span v-if="!issueData?.label_details.length" class="q-mr-xs"
            >Редактировать теги</span
          >
          <EditIcon />
        </q-btn>
      </div>
    </div>
    <q-card
      v-if="lockedBy"
      class="row items-center q-mb-md q-pa-sm rounded-borders"
    >
      <q-icon name="lock" size="20px" class="q-mr-sm text-negative" />
      <AvatarImage
        :key="lockedBy.id"
        size="35px"
        prefix="Сейчас редактирует"
        :tooltip="avatarText(lockedBy).join(' ')"
        :text="
          [avatarText(lockedBy)[0]?.at(0), avatarText(lockedBy)[1]?.at(0)].join(
            ' ',
          )
        "
        :image="lockedBy.avatar_id ?? ''"
        :member="lockedBy"
        @click.stop="
          $router.push({
            path: `/${route.params.workspace}/user-activities/${lockedBy.id}`,
          })
        "
      />
      <span class="q-ml-sm text-body2 text-weight-medium">
        {{ getFullName(lockedBy) }}
      </span>
      <span class="q-ml-xs text-body2 text-grey-6 text-weight-medium"
        >сейчас редактирует</span
      >
    </q-card>
    <div
      class="full-w"
      v-click-outside:prevent-click-issue-outside="{
        isAutoSave,
        onClickOutside: handleAutoSave,
      }"
    >
      <IssueDescriptionEditor
        :isReadonly="isReadOnlyEditor"
        :isAutosave="isAutoSave"
        :isAllowedToEdit="isAdminOrAuthor"
        @autoSave="handleAutoSave()"
        @toggleEdit="handleEnableEdit()"
        @get-editor="(editorInstance) => (editor = editorInstance)"
        ref="editorContainer"
        @drop.prevent="
          (e: DragEvent) => (!isReadOnlyEditor ? handleDrop(e) : '')
        "
        @dragover.prevent
      />
    </div>
    <q-card-actions v-if="isAdminOrAuthor && !isReadOnlyEditor" align="right">
      <q-btn
        class="secondary-btn"
        :class="isAutoSave ? preventClickClass : ''"
        no-caps
        @click="handleUndoEdit"
      >
        Отмена
      </q-btn>
      <q-btn
        class="primary-btn"
        :class="isAutoSave ? preventClickClass : ''"
        no-caps
        @click="handleUpdateTitleAndEditor"
      >
        Сохранить
      </q-btn>
    </q-card-actions>

    <IssueTagsDialog
      v-model="showTagsDialog"
      :tags="issueData.label_details"
      :isDisabled="
        !hasPermissionByIssue(issueData, project, 'change-issue-secondary')
      "
      @close="showTagsDialog = !showTagsDialog"
      @refresh="refresh"
    />
  </div>
</template>

<script setup lang="ts">
// core
import { storeToRefs } from 'pinia';
import { Editor } from '@tiptap/vue-3';
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';

import { useRoute, onBeforeRouteLeave } from 'vue-router';

// stores
import { useUserStore } from 'src/stores/user-store';
import { useRolesStore } from 'src/stores/roles-store';
import { useProjectStore } from 'src/stores/project-store';
import { useSingleIssueStore } from 'src/stores/single-issue-store';
import { useWorkspaceStore } from 'src/stores/workspace-store';
import { useAiplanStore } from 'src/stores/aiplan-store';

// utils
import { handleEditorValue } from 'src/components/editorV2/utils/tiptap';
import { getFullName } from 'src/utils/helpers';
import aiplan from 'src/utils/aiplan';
import { usePalette } from 'src/modules/project-settings/labels/composables/usePalette';

import { useAttachmentsWithEditor } from 'src/composables/useAttachmentsWithEditor';

// components
import IssueTagsDialog from 'src/modules/single-issue/main-issue-info/ui/IssueTagsDialog.vue';
import MenuIcon from 'components/icons/MenuIcon.vue';
import EditIcon from 'components/icons/EditIcon.vue';
import AvatarImage from 'src/components/AvatarImage.vue';

// directives
import ClickOutside from 'src/directives/click-outside';
import { useNotificationStore } from 'stores/notification-store';
import IssueNameInput from './IssueNameInput.vue';
import IssueDescriptionEditor from './IssueDescriptionEditor.vue';

import { updateIssueInfo } from '../../services/api';
import { DtoUserLight } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { useLockIssueInfo } from '../composables/useLockIssueInfo';

defineOptions({
  directives: {
    ClickOutside,
  },
});

const emit = defineEmits([
  'update:issuePage',
  'toggleDrawer',
  'uploadAttachment',
]);

// stores
const userStore = useUserStore();
const projectStore = useProjectStore();
const singleIssueStore = useSingleIssueStore();
const aiplanStore = useAiplanStore();
const { hasPermissionByIssue } = useRolesStore();
const workspaceStore = useWorkspaceStore();

// store to refs
const { user } = storeToRefs(userStore);
const { currentProjectID, project } = storeToRefs(projectStore);
const { issueData } = storeToRefs(singleIssueStore);
const { setNotificationView } = useNotificationStore();
const { currentWorkspaceSlug } = storeToRefs(workspaceStore);

// vars
const editor = ref<Editor>();
const isReadOnlyEditor = ref(true);

const initialIssueName = ref();
const initialIssueDescription = ref();

const preventClickClass = 'prevent-click-issue-outside';
const route = useRoute();

const showTagsDialog = ref(false);

const { getCorrectColor } = usePalette();

const avatarText = (user: DtoUserLight) => {
  return aiplan.UserName(user);
};

const { lockedBy, isTimeExpire, handlWrapperForTryingToLock, stopLocking } =
  useLockIssueInfo(
    route.params.workspace as string,
    route.params.project as string,
    route.params.issue as string,
  );

watch(isTimeExpire, async (newValue) => {
  if (newValue) await handleUpdateTitleAndEditor();
});

const handleUndoEdit = () => {
  stopLocking();
  isReadOnlyEditor.value = true;
  issueData.value.name = initialIssueName.value.trim();
  issueData.value.description_html = initialIssueDescription.value;
};

const handleUpdateTitleAndEditor = async () => {
  const contents = await handleEditorValue(issueData.value.description_html);
  issueData.value.name = issueData.value.name.trim().length
    ? issueData.value.name.trim()
    : initialIssueName.value.trim();
  await updateIssueInfo(
    route.params.workspace as string,
    route.params.project as string,
    route.params.issue as string,
    {
      name: issueData.value.name,
      description_html: contents.html as string,
      description_stripped: editor.value?.getText(),
      description_type: 1,
      description_json: editor.value?.getJSON(),
    },
    contents?.files ?? [],
  )
    .then(() => {
      initialIssueName.value = issueData.value?.name.trim();
      initialIssueDescription.value = issueData.value?.description_html;

      if (issueData.value) {
        issueData.value.description_html = initialIssueDescription.value;
      }

      setNotificationView({
        open: true,
        type: 'success',
      });
      emit('update:issuePage');
    })
    .catch(() => {
      if (issueData.value) {
        issueData.value.name = initialIssueName.value.trim();
        issueData.value.description_html = initialIssueDescription.value;
      }
      stopLocking();
    })
    .finally(() => {
      isReadOnlyEditor.value = true;
    });
};

const editTitle = () => {
  handlWrapperForTryingToLock(async () => {
    await refresh();

    if (isAdminOrAuthor.value) {
      isReadOnlyEditor.value = false;
    }

    initialIssueName.value = issueData.value.name.trim();
    initialIssueDescription.value = issueData.value.description_html;
  });
};

const handleEnableEdit = () => {
  handlWrapperForTryingToLock(async () => {
    await refresh();
    isReadOnlyEditor.value = false;
    initialIssueName.value = issueData.value.name.trim();
    initialIssueDescription.value = issueData.value.description_html;

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  });
};

const handleAutoSave = async () => {
  if (isAutoSave.value && !isReadOnlyEditor.value) {
    await handleUpdateTitleAndEditor();
  }
};

// computed
const isAdminOrAuthor = computed(() => {
  return hasPermissionByIssue(
    issueData.value,
    project.value,
    'change-issue-primary',
  );
});

const isAutoSave = computed(() => user.value?.view_props?.autoSave);

//hook
onBeforeRouteLeave(async (to, from, next) => {
  if (isAutoSave.value && !isReadOnlyEditor.value) {
    await handleAutoSave();
  }
  next();
});

const handleAddListener = () => {
  window.addEventListener('beforeunload', (e) => {
    if (isAutoSave.value && !isReadOnlyEditor.value) {
      e.preventDefault();
      e.returnValue = '';
    }
  });
};

const handleRemoveListener = () => {
  window.removeEventListener('beforeunload', (e) => {
    if (isAutoSave.value && !isReadOnlyEditor.value) {
      e.preventDefault();
      e.returnValue = '';
    }
  });
};

const refresh = async () => {
  await singleIssueStore.getIssueData(
    currentWorkspaceSlug.value as string,
    currentProjectID.value,
  );
};

const toggleDrawer = () => {
  emit('toggleDrawer');
};

const editorContainer = ref<HTMLElement>();

const { handleDrop } = useAttachmentsWithEditor(
  editor,
  (file: File) =>
    aiplanStore.issueAttachmentsUploadFile(file, issueData.value.id),
  () =>
    aiplanStore.issueAttachmentsList(
      issueData.value.project,
      issueData.value.id,
    ),
  () => emit('uploadAttachment'),
);

onMounted(() => {
  handleAddListener();
});

onBeforeUnmount(() => {
  handleAutoSave();
  if (!isReadOnlyEditor.value) stopLocking();
  handleRemoveListener();
});
</script>

<style lang="scss">
.editor-lock-banner {
  /* мягкий жёлтый как предупреждение */
  border: 1px solid #ffeeba;
}

.issue-chip {
  font-size: 14px;
  border-radius: 16px;
  padding: 8px;

  &--removable {
    padding-right: 16px;
  }
}
.issue-tags-edit-btn {
  color: $dark-gray;
}
</style>
