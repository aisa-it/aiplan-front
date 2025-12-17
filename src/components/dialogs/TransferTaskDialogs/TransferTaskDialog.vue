<template>
  <q-dialog ref="dialogRef" @hide="() => clear()" persistent>
    <q-card class="modal-card">
      <q-card-section class="column q-pt-none">
        <h6 class="q-ma-md">Копировать или перенести задачу</h6>
        <q-select
          v-model="selectedProject"
          dense
          label="Проект"
          behavior="menu"
          class="base-selector"
          popup-content-class="scrollable-content"
          use-input
          input-debounce="200"
          @filter="filterProject"
          :options="projects"
          :option-value="(v) => v.id"
          :option-label="(v) => v.name"
          :style="'width: 100%'"
          @update:model-value="updateSelectedProject"
        >
          <template v-slot:no-option>
            <q-item>
              <q-item-section class="text-grey"> Нет проектов </q-item-section>
            </q-item>
          </template>
        </q-select>

        <template v-if="isDifferentProjectSelected">
          <div v-for="(item, index) of actionsType" :key="item.value">
            <q-item tag="label">
              <q-item-section>
                <q-radio
                  v-model="selectedAction"
                  :val="item.value"
                  :label="`${item.label} задачу`"
                />
                <q-item tag="label" @click="setAction(item.value)">
                  <q-item-section
                    avatar
                    :class="{
                      'no-pointer-events': item.value !== selectedAction,
                    }"
                  >
                    <q-checkbox v-model="actionWithLinkedIssues[index]" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label
                      >{{ item.label }} всё дерево задач</q-item-label
                    >
                    <q-item-label caption>
                      {{ item.label }} совместно с родительской задачей и всеми
                      подзадачами
                    </q-item-label>
                  </q-item-section>
                </q-item>
                <q-item
                  v-if="issueData?.label_details.length === 1"
                  tag="label"
                  class="full-w"
                  @click="setAction(item.value)"
                >
                  <q-item-section
                    avatar
                    :class="{
                      'no-pointer-events': item.value !== selectedAction,
                    }"
                  >
                    <q-checkbox v-model="actionByLabel[index]" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ item.label }} по тегу</q-item-label>
                    <q-item-label caption class="word-wrap">
                      {{ item.label }} все задачи с тегом
                      <b>{{ issueData?.label_details[0]?.name }}</b>
                    </q-item-label>
                  </q-item-section>
                </q-item>
                <q-item
                  v-if="issueData?.label_details.length > 1"
                  tag="label"
                  @click="setAction(item.value)"
                >
                  <q-item-section
                    avatar
                    :class="{
                      'no-pointer-events': item.value !== selectedAction,
                    }"
                  >
                    <q-checkbox
                      v-model="actionByLabel[index]"
                      @update:model-value="updateIsLabelTransferOn"
                    />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ item.label }} по тегу</q-item-label>
                    <q-item-label caption>
                      {{ item.label }} все задачи с выбранным тегом
                    </q-item-label>
                  </q-item-section>
                </q-item>
                <q-item
                  v-if="
                    actionByLabel[index] && issueData?.label_details.length > 1
                  "
                  class="full-w"
                >
                  <q-select
                    ref="selectTagsRef"
                    v-model="transferLabel"
                    dense
                    :options="issueData?.label_details"
                    :option-value="(label) => label.id"
                    :option-label="(label) => label.name"
                    class="base-selector full-w"
                    :popup-content-style="selectTagsWidth"
                    popup-content-class="scrollable-content custom-menu"
                    label="Теги"
                  >
                    <template v-slot:option="scope">
                      <q-item v-bind="scope.itemProps">
                        <q-item-section>
                          <q-item-label class="flex flex-center no-wrap">
                            <q-badge
                              rounded
                              class="q-mr-sm"
                              :style="'background-color: ' + scope.opt.color"
                            />
                            <span class="word-wrap" style="width: 95%">
                              {{ scope.opt.name }}
                            </span>
                          </q-item-label>
                        </q-item-section>
                      </q-item>
                    </template>
                  </q-select>
                </q-item>
              </q-item-section>
            </q-item>
          </div>
          <q-item tag="label">
            <q-item-section avatar>
              <q-checkbox v-model="isCreateEntity" />
            </q-item-section>
            <q-item-section>
              <q-item-label caption>
                Создать отсутствующие статусы и теги
              </q-item-label>
            </q-item-section>
          </q-item>
        </template>
        <q-item v-else tag="label">
          <q-item-section>
            <q-radio
              v-model="actionsType[0].value"
              :val="actionsType[0].value"
              :label="`Копировать задачу`"
              disable
            />
          </q-item-section>
        </q-item>

        <q-btn
          :disable="isMultipleIssuesTransfer"
          flat
          dense
          no-caps
          color="primary"
          label="Настройка параметров задачи"
          class="q-mt-sm no-hover-btn"
          style="align-self: flex-start"
          @click="settings = true"
        >
        </q-btn>

        <TransferTaskParameters
          v-model="settings"
          :issue="props.issue"
          :issue_settings="issueSettings"
          @save="saveSettings"
        />

        <div v-if="transferErrors.length" class="full-w">
          <h6 style="margin: 12px 0 0 0 !important; color: #dc3e3e">Ошибки</h6>

          <div class="q-pt-md">
            <p
              v-if="isFindTransferErrorsByCurrentIssueIdOrType"
              style="font-weight: 600; font-size: 16px; margin-bottom: 16px"
            >
              Текущая задача
            </p>
            <p
              v-for="(log, index) in filterTransferErrorsByCurrentIssueIdOrType"
              :key="index"
              v-html="logsRUS(log.error, log, selectedProject?.name)"
              class="word-wrap q-mb-sm"
            ></p>
            <div v-if="filterTransferErrorsByNotCurrentIssueIdAndType.length">
              <p style="font-weight: 600; font-size: 16px; margin: 16px 0">
                Дерево задач
              </p>
              <p
                v-for="(
                  log, index
                ) in filterTransferErrorsByNotCurrentIssueIdAndType"
                :key="index"
                v-html="logsRUS(log.error, log, selectedProject?.name)"
                class="word-wrap q-mb-sm"
              ></p>
            </div>
          </div>
        </div>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn
          flat
          no-caps
          label="Отменить"
          class="secondary-btn"
          v-close-popup
        />
        <q-btn
          flat
          no-caps
          label="Выполнить"
          class="primary-btn"
          :disable="
            isDifferentProjectSelected && !(selectedProject && selectedAction)
          "
          @click="transfer"
        />
      </q-card-actions>
      <q-inner-loading :showing="loading">
        <DefaultLoader />
      </q-inner-loading>
    </q-card>
  </q-dialog>
</template>

<script lang="ts" setup>
// core
import { storeToRefs } from 'pinia';
import { useRoute, useRouter } from 'vue-router';
import { computed, ref, watch, onMounted } from 'vue';
import { useNotificationStore } from 'src/stores/notification-store';

// stores
import { useRolesStore } from 'src/stores/roles-store';
import { useWorkspaceStore } from 'src/stores/workspace-store';
import { useSingleIssueStore } from 'src/stores/single-issue-store';
import { useProjectStore } from 'src/stores/project-store';

// components
import DefaultLoader from 'components/loaders/DefaultLoader.vue';

// components - icons
import TransferTaskParameters from './TransferTaskParameters.vue';

// interfaces
import {
  IIssueTransferById,
  IIssueTransferByLabel,
  IIssueTransferParams,
} from 'src/interfaces/issues';
import { IProject } from 'src/interfaces/projects';
import { IMigrationError } from 'src/interfaces/notifications';

// utils
import { logsRUS } from 'src/utils/translator';
import { useResizeObserverSelect } from 'src/utils/useResizeObserverSelect';
import { getIssueLink, getProjectLink } from 'src/utils/links';
import {
  getSuccessCopyIssueByLabelMessage,
  getSuccessCopyIssueMessage,
  getSuccessTransferIssueByLabelMessage,
  getSuccessTransferIssueMessage,
} from 'src/utils/notifications';

// constants
import { DEFAULT_TRANSFER_MODEL } from 'src/constants/constants';

const ACTIONS = {
  COPY: 'COPY',
  TRANSFER: 'TRANSFER',
};

// props
const props = withDefaults(
  defineProps<{
    issue: any;
  }>(),
  {
    issue: () => {
      return {};
    },
  },
);

// emits
const emit = defineEmits<{
  refresh: [];
}>();

// store
const rolesStore = useRolesStore();
const projectStore = useProjectStore();
const workspaceStore = useWorkspaceStore();
const singleIssueStore = useSingleIssueStore();
const { setNotificationView } = useNotificationStore();

// store to refs
const { currentIssueID, isPreview } = storeToRefs(singleIssueStore);
const { workspaceProjects, currentWorkspaceSlug } = storeToRefs(workspaceStore);

// vars
const route = useRoute();
const router = useRouter();
const transferModel = ref<IIssueTransferById | IIssueTransferByLabel>(
  DEFAULT_TRANSFER_MODEL,
);
const transferData = ref();
const transferLabel = ref();
const dialogRef = ref();
const issueData = ref(props.issue);
const issueSettings = ref({
  state_detail: props.issue.state_detail,
  priority: props.issue.priority,
  target_date: props.issue.target_date,
  assignees: props.issue.assignee_details.map((assignee) => ({
    member: assignee,
  })),
  watchers: props.issue.watcher_details.map((watcher) => ({
    member: watcher,
  })),
});

let editedIssueParams = <IIssueTransferParams>{};
const selectedProject = ref();
const projects = ref<IProject[]>(workspaceProjects.value as IProject[]);
const transferErrors = ref([]);
const selectTagsRef = ref();
const { getWidthStyle: selectTagsWidth } =
  useResizeObserverSelect(selectTagsRef);
const selectedAction = ref();
const actionWithLinkedIssues = ref<boolean[]>([]);
const isCreateEntity = ref<boolean>(false);
const actionByLabel = ref<boolean[]>([]);
const actionsType = [
  {
    label: 'Копировать',
    value: ACTIONS.COPY,
  },
  {
    label: 'Перенести',
    value: ACTIONS.TRANSFER,
  },
];
const loading = ref(false);
const openedtIssueID = ref('');
const settings = ref(false);

// computed
const isDifferentProjectSelected = computed<boolean>(
  () =>
    selectedProject.value?.identifier !== (route.params.project as string) ||
    selectedProject.value?.identifier !== issueData.value.project,
);

const isMultipleIssuesTransfer = computed<boolean>(
  () =>
    actionWithLinkedIssues.value.some((el) => el === true) ||
    actionByLabel.value.some((el) => el === true),
);

const filterTransferErrorsByCurrentIssueIdOrType = computed(() => {
  return transferErrors.value.filter(
    (error: any) =>
      error?.issue_sequence_id == currentIssueID.value || !error?.type,
  );
});

const isFindTransferErrorsByCurrentIssueIdOrType = computed(() => {
  return transferErrors.value.find(
    (error: any) =>
      error?.issue_sequence_id == currentIssueID.value || !error?.type,
  );
});

const filterTransferErrorsByNotCurrentIssueIdAndType = computed(() => {
  return transferErrors.value.filter(
    (error: any) =>
      error?.issue_sequence_id != currentIssueID.value && !!error?.type,
  );
});

const assignerIds = computed(() =>
  issueSettings.value.assignees
    ? issueSettings.value.assignees.map((assignee) =>
        assignee.member ? assignee.member.id || assignee.id : assignee,
      )
    : [],
);

const watcherIds = computed(() =>
  issueSettings.value.watchers
    ? issueSettings.value.watchers.map((watcher) =>
        watcher.member ? watcher.member.id || watcher.id : watcher,
      )
    : [],
);

// function
const clear = () => {
  transferLabel.value = null;
  transferErrors.value = [];
  transferModel.value.delete_src = false;
  transferModel.value.linked_issues = false;
  selectedProject.value = null;
  selectedAction.value = null;
  transferData.value = null;
  editedIssueParams = {};
  issueSettings.value = {
    state_detail: props.issue.state_detail,
    priority: props.issue.priority,
    target_date: props.issue.target_date,
    assignees: props.issue.assignee_details.map((assignee) => ({
      member: assignee,
    })),
    watchers: props.issue.watcher_details.map((watcher) => ({
      member: watcher,
    })),
  };
};

const onCancel = (type: 'ok' | 'error', errors?: IMigrationError[]) => {
  if (type === 'ok') {
    const link =
      transferData.value && transferData.value.id
        ? getIssueLink(
            currentWorkspaceSlug.value,
            selectedProject.value.identifier,
            transferData.value.sequence_id || transferData.value.id,
          )
        : getProjectLink(
            currentWorkspaceSlug.value,
            selectedProject.value.identifier,
          );
    const copyMessage =
      transferData.value && transferData.value.sequence_id
        ? getSuccessCopyIssueMessage(
            link,
            `${issueData.value.project_detail.identifier}-${issueData.value.sequence_id}`,
            `${selectedProject.value.identifier}-${transferData.value.sequence_id}`,
          )
        : getSuccessCopyIssueByLabelMessage(link);
    const transferMessage =
      transferData.value && transferData.value.id
        ? getSuccessTransferIssueMessage(
            link,
            `${issueData.value.project_detail.identifier}-${issueData.value.sequence_id}`,
          )
        : getSuccessTransferIssueByLabelMessage(link);

    setNotificationView({
      open: true,
      type: 'success',
      customMessage:
        selectedAction.value === ACTIONS.COPY ? copyMessage : transferMessage,
    });
  }

  if (type === 'error') {
    setNotificationView({
      open: true,
      type: 'error',
      logs: errors ?? [],
    });
  }

  if (transferModel.value.delete_src) {
    if (isPreview.value) {
      emit('refresh');
      isPreview.value = false;
    }

    let path = `/${route.params.workspace}`;

    if (route.params.project) {
      path += `/projects/${route.params.project}/issues`;
    }

    if (route.params.sprint) {
      path += `/sprints/${route.params.sprint}`;
    }

    router.push(path);
  }

  clear();
};

const sendDataById = async () => {
  const transferDataById = {
    ...transferModel.value,
    src_issue: issueData.value.id,
  };

  await singleIssueStore
    .issueTransferById(
      transferDataById as IIssueTransferById,
      isCreateEntity.value,
      isMultipleIssuesTransfer.value ? null : editedIssueParams,
    )
    .then(async (res) => {
      const issueResponse = await singleIssueStore.getIssueDataById(
        currentWorkspaceSlug.value,
        selectedProject.value.identifier,
        res.data.id,
      );
      const newIssueData = issueResponse.data;

      transferData.value = {
        id: newIssueData.id,
        sequence_id: newIssueData.sequence_id,
        project_identifier:
          newIssueData.project_detail?.identifier ||
          newIssueData.project?.identifier,
      };
      dialogRef.value.hide();
      onCancel('ok');
    })
    .catch((err) => {
      console.error('Ошибка:', err);
      transferErrors.value = err.response?.data?.errors;
    })
    .finally(() => {
      currentIssueID.value = openedtIssueID.value;
      loading.value = false;
    });
};

const sendDataByLabel = async () => {
  const transferDataByLabel = {
    ...transferModel.value,
    src_label: transferLabel.value?.id || issueData.value?.label_details[0]?.id,
  };

  await singleIssueStore
    .issueTransferByLabel(
      transferDataByLabel as IIssueTransferByLabel,
      isCreateEntity.value,
    )
    .then(() => {
      dialogRef.value.hide();
      onCancel('ok');
    })
    .catch((err) => {
      console.error('Ошибка:', err);
      transferErrors.value = err.response?.data?.errors;
    })
    .finally(() => {
      currentIssueID.value = openedtIssueID.value;
      loading.value = false;
    });
};

const transfer = async () => {
  loading.value = true;
  openedtIssueID.value = currentIssueID.value;
  currentIssueID.value = '';
  transferModel.value.target_project = selectedProject.value.id;
  transferModel.value.delete_src = selectedAction.value === ACTIONS.TRANSFER;
  transferModel.value.linked_issues = actionWithLinkedIssues.value.some(
    (el) => el === true,
  );
  actionByLabel.value.some((el) => el === true)
    ? await sendDataByLabel()
    : await sendDataById();
};

const filterProject = (val: string, update: any) => {
  const options = (workspaceProjects.value as IProject[]).filter(
    (project) =>
      project?.current_user_membership ||
      rolesStore.hasPermissionByIssue(
        props.issue.id,
        projectStore.project,
        'transfer-issue',
      ),
  );

  if (val === '') {
    update(() => (projects.value = options));
    return;
  }

  update(() => {
    const needle = val.toLowerCase();
    projects.value = options.filter((v) => v.name.indexOf(needle) > -1);
  });
};

const updateSelectedProject = () => {
  transferErrors.value = [];
};

const updateIsLabelTransferOn = (newVal: boolean) => {
  if (!newVal) {
    transferLabel.value = null;
  }
};

const setAction = (action: string) => {
  selectedAction.value = action;
};

const resetActionOptions = () => {
  actionsType.forEach((item, index) => {
    actionWithLinkedIssues.value[index] = false;
    actionByLabel.value[index] = false;
  });
  transferLabel.value = null;
};

const arraysEqual = (arr1: string[], arr2: string[]): boolean => {
  if (arr1.length !== arr2.length) return false;
  const sorterArr1 = [...arr1].sort();
  const sorterArr2 = [...arr2].sort();

  return sorterArr1.every((value, index) => value === sorterArr2[index]);
};

const saveSettings = (data: typeof issueSettings) => {
  const newSettings = data.value;
  editedIssueParams = {};

  if (newSettings.state_detail.id !== issueSettings.value.state_detail.id) {
    issueSettings.value.state_detail = newSettings.state_detail;
    editedIssueParams.state_id = newSettings.state_detail.id;
  }

  if (newSettings.priority !== issueSettings.value.priority) {
    issueSettings.value.priority = newSettings.priority;
    editedIssueParams.priority = newSettings.priority;
  }

  if (newSettings.target_date !== issueSettings.value.target_date) {
    issueSettings.value.target_date = newSettings.target_date;
    editedIssueParams.target_date = newSettings.target_date;
  }

  const newAssignerIds = newSettings.assignees
    ? newSettings.assignees.map((assignee) =>
        assignee.member ? assignee.member.id || assignee.id : assignee,
      )
    : [];

  if (!arraysEqual(newAssignerIds, assignerIds)) {
    issueSettings.value.assignees = newSettings.assignees;
    editedIssueParams.assigner_ids = newAssignerIds;
  }

  const newWatcherIds = newSettings.watchers
    ? newSettings.watchers.map((watcher) =>
        watcher.member ? watcher.member.id || watcher.id : watcher,
      )
    : [];

  if (!arraysEqual(newWatcherIds, watcherIds)) {
    issueSettings.value.watchers = newSettings.watchers;
    editedIssueParams.watcher_ids = newWatcherIds;
  }

  return;
};

// hooks

watch(
  () => props.issue,
  () => (issueData.value = props.issue),
);

watch(
  () => route.params.workspace,
  () => (projects.value = workspaceProjects.value as IProject[]),
);

watch(
  () => isDifferentProjectSelected.value,
  () => {
    if (!isDifferentProjectSelected.value) selectedAction.value = ACTIONS.COPY;
  },
);

watch(
  () => selectedAction.value,
  () => resetActionOptions(),
);

onMounted(() => {
  actionsType.forEach((item, index) => {
    actionWithLinkedIssues.value[index] = false;
    actionByLabel.value[index] = false;
  });
});
</script>

<style lang="scss" scoped>
:deep(.q-btn .q-focus-helper) {
  display: none;
}
</style>
