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
            :style="'background-color: ' + t.color"
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
import { onBeforeRouteLeave } from 'vue-router';
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';

import { useRoute } from 'vue-router';

// stores
import { useUserStore } from 'src/stores/user-store';
import { useRolesStore } from 'src/stores/roles-store';
import { useProjectStore } from 'src/stores/project-store';
import { useSingleIssueStore } from 'src/stores/single-issue-store';
import { useWorkspaceStore } from 'src/stores/workspace-store';

// utils
import { handleEditorValue } from 'src/components/editorV2/utils/tiptap';

// components
import IssueTagsDialog from 'src/modules/single-issue/main-issue-info/ui/IssueTagsDialog.vue';
import MenuIcon from 'components/icons/MenuIcon.vue';
import EditIcon from 'components/icons/EditIcon.vue';

// directives
import ClickOutside from 'src/directives/click-outside';
import { useNotificationStore } from 'stores/notification-store';
import IssueNameInput from './IssueNameInput.vue';
import IssueDescriptionEditor from './IssueDescriptionEditor.vue';

import { updateIssueInfo } from '../../services/api';

defineOptions({
  directives: {
    ClickOutside,
  },
});

const emit = defineEmits(['update:issuePage', 'toggleDrawer']);

// stores
const userStore = useUserStore();
const projectStore = useProjectStore();
const singleIssueStore = useSingleIssueStore();
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

const handleUndoEdit = () => {
  isReadOnlyEditor.value = !isReadOnlyEditor.value;
  issueData.value.name = initialIssueName.value.trim();
  issueData.value.description_html = initialIssueDescription.value;
};

const handleUpdateTitleAndEditor = async () => {
  const contents = await handleEditorValue(issueData.value.description_html);
  const descriptionJson = (isReadOnlyEditor.value = true);
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
    });
};

const editTitle = () => {
  if (isAdminOrAuthor.value) {
    isReadOnlyEditor.value = false;
  }

  initialIssueName.value = issueData.value.name.trim();
  initialIssueDescription.value = issueData.value.description_html;
};

const handleEnableEdit = () => {
  isReadOnlyEditor.value = false;
  initialIssueName.value = issueData.value.name.trim();
  initialIssueDescription.value = issueData.value.description_html;

  window.scrollTo({
    top: 0,
    behavior: 'smooth',
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
    next();
  } else {
    next();
  }
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
    currentWorkspaceSlug.value,
    currentProjectID.value,
  );
};

const toggleDrawer = () => {
  emit('toggleDrawer');
};

onMounted(() => {
  handleAddListener();
});

onBeforeUnmount(() => {
  handleAutoSave();
  handleRemoveListener();
});
</script>

<style lang="scss">
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
