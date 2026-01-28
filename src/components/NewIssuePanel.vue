<template>
  <q-card
    :class="[
      { 'new-issue-card': !isIssuesTemplate, 'modal-card': !isIssuesTemplate },
    ]"
    ref="newIssueCardRef"
  >
    <div class="relative-position">
      <q-card-section>
        <div v-if="project" class="relative-position">
          <div class="row flex items-stretch content-stretch q-mb-xs">
            <q-select
              dense
              v-model="project"
              :options="projects"
              class="base-selector"
              popup-content-class="scrollable-content fit-popup"
              :option-label="
                (item) =>
                  `${item.identifier} ${item.name ? ' (' + item.name + ')' : ''}`
              "
              label="Проект"
              style="min-width: 100px"
            >
              <template v-slot:selected>{{ project.identifier }}</template>
            </q-select>
            <q-input
              dense
              v-model="name"
              class="q-ml-sm base-input"
              style="flex: 1"
              label="Название"
              ref="titleRef"
              :rules="[
                (val) =>
                  (val && val.length > 0) || 'Необходимо ввести название',
              ]"
            />

            <SelectSingleIssueTemplate
              v-model="selectedIssueTemplate"
              :options="templatesOptions"
              :loading="loadingTemplates"
              :newIssue="true"
              @delete="handleDeleteTemplate"
              @virtual-scroll="
                (arg) => fetchOnScroll(workspaceSlug, project?.id, arg)
              "
              @clear="handleClearIssueTemplate"
            />
          </div>
          <EditorTipTapV2
            v-model="description"
            @get-editor="getEditorInstance"
            :members="projectMembers"
            :get-members-for-mention="getProjectMembersForMention"
            is-mention
            editor-id="editor"
          />
        </div>
      </q-card-section>

      <q-card-section
        v-if="project"
        :class="$q.screen.width > 720 ? 'row' : 'column'"
      >
        <div class="col">
          <div class="row q-mb-sm centered-horisontally">
            <div class="col centered-horisontally issue-selector-label">
              <PriorityIcon />
              <span class="q-ml-sm"> Приоритет </span>
            </div>
            <PriorityIcon class="issue-selector-icon mr-12" />

            <select-priority
              class="col centered-horisontally"
              label="Выберите приоритет"
              v-model:priority="priority"
              :workspace-slug="currentWorkspaceSlug"
              :projectid="project.id"
              :new-issue="true"
            ></select-priority>
          </div>
          <div class="row q-mb-sm centered-horisontally">
            <div class="col centered-horisontally issue-selector-label">
              <UserIcon />
              <span class="q-ml-sm"> Исполнитель </span>
            </div>
            <UserIcon class="issue-selector-icon mr-12" />

            <SelectAssignee
              v-model:assigness="assigness"
              :projectid="project.id"
              :defaultAssignee="project.default_assignees_details"
              :current-member="user"
              :new-issue="true"
              label="Выберите исполнителя"
              class="col centered-horisontally"
            ></SelectAssignee>
          </div>
          <div class="row q-mb-sm centered-horisontally">
            <div class="col centered-horisontally issue-selector-label">
              <ObserveIcon />
              <span class="q-ml-sm"> Наблюдатель </span>
            </div>
            <ObserveIcon class="issue-selector-icon mr-12" />

            <SelectWatchers
              v-model:watchers="watchers"
              :projectid="project.id"
              :current-member="user"
              :new-issue="true"
              label="Выберите наблюдателя"
              class="col centered-horisontally"
            ></SelectWatchers>
          </div>

          <div
            v-if="hasPermissionByWorkspace(workspaceInfo, 'change-sprint')"
            class="row q-mb-sm centered-horisontally"
          >
            <div class="col centered-horisontally issue-selector-label">
              <SprintIcon />
              <span class="q-ml-sm"> Спринт </span>
            </div>
            <SprintIcon class="issue-selector-icon mr-12" />
            <SelectSprints
              v-model="sprints"
              class="col centered-horisontally"
              label="Выберите спринт"
            />
          </div>
        </div>
        <q-separator vertical class="q-mx-md" />
        <div class="col">
          <div class="row q-mb-sm centered-horisontally">
            <div class="col centered-horisontally issue-selector-label">
              <CheckStatusIcon />
              <span class="q-ml-sm"> Статус </span>
            </div>
            <CheckStatusIcon class="issue-selector-icon mr-12" />

            <select-status
              :projectid="project.id"
              v-model:status="status"
              @updateInitialStatus="(s) => (status = s)"
              label="Выберите статус"
              class="col centered-horisontally"
            ></select-status>
          </div>

          <div class="row q-mb-sm centered-horisontally">
            <div class="col centered-horisontally issue-selector-label">
              <CalendarIcon />
              <span class="q-ml-sm"> Срок исполнения </span>
            </div>
            <CalendarIcon class="issue-selector-icon" />

            <select-date
              v-model:date="date"
              :workspace-id="currentWorkspaceSlug"
              :project-id="project.id"
              :new-issue="true"
              :auto-update="autoupdateDate"
              placeholder="Выберите дату"
              class="col centered-horisontally"
            ></select-date>
          </div>

          <div class="row q-mb-sm centered-horisontally">
            <div class="col centered-horisontally issue-selector-label">
              <ShareIcon />
              <span class="q-ml-sm"> Родитель </span>
            </div>
            <ShareIcon class="issue-selector-icon" />

            <select-parent-issue
              v-model:issue="parent"
              :projectid="project.id"
              :project="project"
              :isDisabled="true"
              :new-issue="true"
              class="col centered-horisontally"
            ></select-parent-issue>
          </div>
          <select-tags
            v-if="hasPermissionByWorkspace(workspaceInfo, 'change-sprint')"
            v-model:tags="tags"
            :projectid="project.id"
            :isDisabled="true"
          >
          </select-tags>
        </div>
        <select-tags
          v-if="!hasPermissionByWorkspace(workspaceInfo, 'change-sprint')"
          v-model:tags="tags"
          :projectid="project.id"
          :isDisabled="true"
          isFullWidth
        >
        </select-tags>
      </q-card-section>

      <SelectAttachments
        ref="selectAttachments"
        draft-mode
        entity-type="issue"
        is-edit
      />

      <q-card-actions class="new-issue-buttons q-px-md">
        <div class="centered-horisontally">
          Сохранить как черновик
          <q-toggle v-model="draft" size="32px" />
        </div>
        <div class="submit-buttons">
          <q-btn
            flat
            dense
            no-caps
            class="secondary-btn q-mr-sm"
            style="width: 100px"
            label="Отмена"
            @click="emits('onCancel')"
          />
          <q-btn
            flat
            dense
            no-caps
            class="primary-btn"
            style="width: 100px"
            label="Добавить"
            @click="create"
          >
            <HintTooltip v-if="!name"> Необходимо ввести название </HintTooltip>
          </q-btn>
        </div>
      </q-card-actions>
      <q-inner-loading style="z-index: 99" :showing="loading">
        <DefaultLoader />
      </q-inner-loading>
    </div>
  </q-card>
</template>

<script setup lang="ts">
// core
import { useRoute } from 'vue-router';
import { ref, onMounted, watch, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { Editor } from '@tiptap/vue-3';
// store
import { useAiplanStore } from 'src/stores/aiplan-store';
import { useWorkspaceStore } from 'src/stores/workspace-store';
import { useNotificationStore } from 'src/stores/notification-store';
import { useSingleIssueStore } from 'src/stores/single-issue-store';
import { useUserStore } from 'stores/user-store';
import { useIssuesStore } from 'src/stores/issues-store';
import { useProjectStore } from 'src/stores/project-store';
import { useRolesStore } from 'src/stores/roles-store';
import { useSprintStore } from 'src/modules/sprints/stores/sprint-store';

// utils
import { handleEditorValue } from 'src/components/editorV2/utils/tiptap';
import { getIssueLink } from 'src/utils/links';
import {
  getSuccessCreateIssueMessage,
  getSuccessCreateSubissueMessage,
} from 'src/utils/notifications';
//composables
import { useSingleIssueTemplate } from 'src/modules/single-issue/linked-issues/composables/useSingleIssueTemplate';
// components
import SelectDate from './SelectDate.vue';
import SelectTags from './SelectTags.vue';
import SelectStatus from './SelectStatus.vue';
import SelectPriority from './SelectPriority.vue';
import SelectAssignee from './selects/SelectAssignee.vue';
import SelectWatchers from './selects/SelectWatchers.vue';
import DefaultLoader from './loaders/DefaultLoader.vue';
import SelectParentIssue from './SelectParentIssue.vue';
import PriorityIcon from './icons/PriorityIcon.vue';
import SelectSingleIssueTemplate from '../modules/project-settings/new-issue-template/ui/SelectSingleIssueTemplate.vue';
import SelectAttachments from './SelectAttachments.vue';
import SprintIcon from './icons/SprintIcon.vue';
import SelectSprints from 'src/components/SelectSprints.vue';

//types
import { QCard } from 'quasar';
//icons
import UserIcon from './icons/UserIcon.vue';
import ObserveIcon from './icons/ObserveIcon.vue';
import CalendarIcon from './icons/CalendarIcon.vue';
import ShareIcon from './icons/ShareIcon.vue';
import CheckStatusIcon from './icons/CheckStatusIcon.vue';
import EditorTipTapV2 from './editorV2/EditorTipTapV2.vue';
import {
  AiplanRequestIssueIdList,
  DtoProject,
  DtoSprintLight,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { sprintIssuesUpdate } from 'src/modules/sprints/services/api';

const props = defineProps<{
  project_detail?: DtoProject;
  parentissue?: string;
  isUserTextData?: boolean;
  isIssuesTemplate?: boolean;
}>();

const emits = defineEmits<{
  onCancel: [];
  changeTextStatus: [status: boolean];
  ok: [];
}>();

//composables
const route = useRoute();
const {
  options: templatesOptions,
  loading: loadingTemplates,
  fetchTemplates,
  deleteTemplate,
  fetchOnScroll,
} = useSingleIssueTemplate();

//stores
const api = useAiplanStore();
const userStore = useUserStore();
const workspaceStore = useWorkspaceStore();
const projectStore = useProjectStore();
const issuesStore = useIssuesStore();
const singleIssueStore = useSingleIssueStore();
const sprintStore = useSprintStore();
const { setNotificationView } = useNotificationStore();
const { hasPermissionByWorkspace } = useRolesStore();

//storesToRefs
const { currentWorkspaceSlug, workspaceInfo } = storeToRefs(workspaceStore);
const { projectMembers } = storeToRefs(projectStore);

const { user } = storeToRefs(userStore);
const { refreshIssues } = storeToRefs(issuesStore);

//variables
const projects = ref([]);
const newIssueCardRef = ref<QCard>();
const titleRef = ref();
const project = ref(null);
const name = ref('');
const description = ref('');
const status = ref(null);
const priority = ref(null);
const assigness = ref([]);
const watchers = ref([]);
const sprints = ref([]);
const tags = ref([]);
const date = ref(null);
const parent = ref(null);
const draft = ref(false);
const selectedIssueTemplate = ref<any>(null);
const loading = ref(true);
const editorInstance = ref<Editor>();
const autoupdateDate = ref<boolean>(true);

const selectAttachments = ref();

//computeds
const workspaceSlug = computed(() => {
  return (route.params.workspace as string) || currentWorkspaceSlug.value;
});
const projectId = computed(() => {
  return props.project_detail?.id ?? (route.params.project as string);
});

//methods
const refresh = async () => {
  loading.value = true;
  await workspaceStore
    .getWorkspaceProjects(currentWorkspaceSlug.value)
    .then((d) => {
      projects.value = d.filter(
        (project) => project?.current_user_membership?.role > 5,
      );
      if (project.value == null) {
        if (route.params?.project || props.project_detail?.id) {
          project.value =
            projects.value?.find(
              (project) =>
                project?.id == route.params?.project ||
                project?.identifier === route.params.project ||
                project?.id === props.project_detail?.id,
            ) || projects.value[0];
        } else {
          project.value = projects.value[0];
        }
      }
      loading.value = false;
    });
};

const getProjectMembersForMention = async (
  search: string,
): Promise<Array<any> | void> => {
  return await projectStore.getProjectMembersForMention(
    null,
    currentWorkspaceSlug.value || '',
    project.value?.id || '',
    { offset: 0, limit: 4, search_query: search },
  );
};

const getEditorInstance = (editor) => {
  editorInstance.value = editor;
};

const handleDeleteTemplate = async (id: string) => {
  try {
    await deleteTemplate(workspaceSlug.value, projectId.value, id);
    setNotificationView({
      open: true,
      type: 'success',
      customMessage: 'Шаблон задачи успешно удален',
    });
    if (selectedIssueTemplate.value?.id === id) {
      handleClearIssueTemplate();
    }
    await fetchTemplates(workspaceSlug.value, projectId.value, true);
  } catch (error) {
    setNotificationView({
      open: true,
      type: 'error',
      customMessage: 'Ошибка при удалении шаблона задачи',
    });
  }
};

const updateSprint = async (sprint: DtoSprintLight, issueid: string) => {
  const data: AiplanRequestIssueIdList = {
    issues_add: [issueid],
  };

  await sprintIssuesUpdate(
    currentWorkspaceSlug.value ?? '',
    sprint.id ?? '',
    data,
  ).catch((err) => {
    setNotificationView({
      open: true,
      type: 'error',
      customMessage: 'Ошибка при обновлении спринтов',
    });
    throw err;
  });

  sprintStore.triggerSprintRefresh();
};

const create = async () => {
  titleRef.value.validate();

  if (titleRef.value.hasError) {
    newIssueCardRef.value?.$el.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
    return;
  }

  loading.value = true;
  const content = await handleEditorValue(description.value);
  const descriptionJson = editorInstance.value?.getJSON();
  autoupdateDate.value = false;
  await singleIssueStore
    .createIssue(
      currentWorkspaceSlug.value,
      project.value?.id,
      name.value,
      content,
      status.value ? status.value?.id : '',
      priority.value,
      assigness.value.map((assignee) =>
        assignee?.member_id ? assignee?.member_id : assignee,
      ),
      watchers.value.map((watcher) =>
        watcher?.member_id ? watcher?.member_id : watcher,
      ),
      tags.value.map((d) => d.id),
      date.value,
      !!parent.value && parent.value?.id !== '' ? parent.value?.id : null,
      draft.value,
      descriptionJson,
    )
    .then(async (res) => {
      const issue = (
        await singleIssueStore.getIssueDataById(
          currentWorkspaceSlug.value,
          project.value?.id,
          res.data.id,
        )
      ).data;

      const link = getIssueLink(
        currentWorkspaceSlug.value,
        project.value?.identifier,
        res.data.id,
      );
      setNotificationView({
        open: true,
        type: 'success',
        customMessage: props.parentissue
          ? getSuccessCreateSubissueMessage(link)
          : getSuccessCreateIssueMessage(
              link,
              `${issue.project_detail.identifier}-${issue.sequence_id}`,
            ),
      });
      await selectAttachments.value.uploadDraftAttachments(res.data.id);

      sprints.value.forEach((sprint) => {
        updateSprint(sprint, issue.id);
      });

      emits('ok');
    })
    .catch(() => {
      loading.value = false;
    });
};

const handleClearIssueTemplate = () => {
  editorInstance.value?.chain().focus().clearContent();
  selectedIssueTemplate.value = null;
};

//hooks
onMounted(async () => {
  await refresh();
  await fetchTemplates(workspaceSlug.value, project.value?.id, true);
  refreshIssues.value = false;
  props.parentissue &&
    api
      .issueInfo(
        props.project_detail?.id ?? (route.params.project as string),
        props.parentissue,
      )
      .then((d) => {
        parent.value = d;
      });
});

watch(
  () => name.value,
  (newValue) => {
    if (newValue !== '') {
      if (props.isUserTextData === false) {
        emits('changeTextStatus', true);
      }
    } else {
      if (props.isUserTextData === true) {
        if (
          description.value === '' ||
          description.value === '<p></p>' ||
          description.value === '<p><br></p>'
        )
          emits('changeTextStatus', false);
      }
    }
  },
);

watch(
  () => description.value,
  (newValue) => {
    if (
      newValue !== '' &&
      newValue !== '<p></p>' &&
      newValue !== '<p><br></p>'
    ) {
      if (!props.isUserTextData) {
        emits('changeTextStatus', true);
      }
    } else if (
      newValue === '' ||
      newValue === '<p></p>' ||
      newValue === '<p><br></p>'
    ) {
      if (props.isUserTextData) {
        if (name.value === '') {
          emits('changeTextStatus', false);
        }
      }
    }
  },
);
watch(
  () => props.parentissue,
  () => {
    refresh();
    if (route.params.project || props.project_detail?.id) {
      api
        .issueInfo(
          props.project_detail?.id ?? (route.params.project as string),
          props.parentissue as string,
        )
        .then((d) => {
          parent.value = d.data;
        });
    }
  },
);

watch(
  () => project.value,
  (newValue, oldValue) => {
    if (newValue?.id !== oldValue?.id) parent.value = null;
    if (project.value?.id)
      fetchTemplates(workspaceSlug.value, project.value?.id);
  },
);

watch(
  () => selectedIssueTemplate.value,
  (newTemplate) => {
    if (newTemplate && newTemplate.template && editorInstance.value) {
      editorInstance.value.commands.focus();
      editorInstance.value.commands.clearContent();
      editorInstance.value.commands.insertContent(newTemplate.template);
    }
  },
);
</script>

<style scoped lang="scss">
.new-issue-card {
  min-width: 66vw !important;
}
@media screen and (max-width: 1350px) {
  .new-issue-card {
    min-width: calc(100vw - 200px) !important;
  }
}
@media screen and (max-width: 1150px) {
  .new-issue-card {
    min-width: calc(100vw - 100px) !important;
  }
}

.new-issue-buttons {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

@media screen and (max-width: 720px) {
  .issue-selector-label {
    display: none;
  }

  .new-issue-buttons {
    flex-direction: column;
    align-items: start;
    .submit-buttons {
      display: flex;
      flex-direction: row;
      width: 100%;
      .q-btn {
        width: 100% !important;
      }
    }
  }
}

@media screen and (min-width: 720px) {
  .issue-selector-icon {
    display: none;
  }
}

@media screen and (min-width: 1024px) {
  :deep(.html-editor) {
    overflow: visible !important;
  }

  :deep(.html-editor__toolbar) {
    width: 99%;
    height: auto;
    position: sticky;
    top: 0;
    z-index: 10;
    background-color: $bg-color;
  }
}
</style>
