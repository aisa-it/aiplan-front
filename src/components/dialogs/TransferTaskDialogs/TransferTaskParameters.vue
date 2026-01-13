<template>
  <q-dialog ref="dialogRef" class="col q-pb-sm q-px-sm" @hide="() => close()">
    <q-card
      class="modal-card modal-card__small"
      :style="{ width: dynamicWidthDialog + 'px' }"
    >
      <q-card-section class="column q-pt-none col q-pb-sm q-px-md">
        <h6 class="text-subtitle1 q-ma-md font-semibold">
          Настройка параметров задачи
        </h6>

        <q-separator class="issue-panel__separator" />

        <!-- Статус -->
        <div class="row q-pt-md centered-horisontally">
          <div class="col q-mb-sm">
            <div class="row items-center">
              <CheckStatusIcon class="issue-icon" /><span class="q-ml-sm">
                Статус
              </span>
            </div>
          </div>
          <div class="col flex rounded-borders">
            <SelectStatus
              class="issue-selector full-w"
              :projectid="props.project_id"
              :status="issueSettings.state_detail"
              :isDisabled="
                !hasPermissionByIssue(issueData, project, 'change-issue-status')
              "
              isAdaptiveSelect
              :states-from-cache="statesCache[issueData?.project]"
              @update:status="
                (val) => {
                  return (issueSettings.state_detail = val);
                }
              "
              @updateInitialStatus="
                (val) => {
                  return (issueSettings.state_detail = val);
                }
              "
            />
          </div>
        </div>

        <!-- Исполнители -->
        <div class="row q-pt-md centered-horisontally">
          <div class="col">
            <div class="row items-center">
              <UsersIcon class="issue-icon" />
              <span class="q-ml-sm"> Исполнители </span>
            </div>
          </div>
          <div
            class="col flex rounded-borders issue-panel__assignees issue-panel__q-select-wrapper"
          >
            <SelectAssignee
              class="issue-selector"
              :projectid="props.project_id"
              :assigness="issueSettings.assignees"
              :isDisabled="
                !hasPermissionByIssue(issueData, project, 'change-issue-basic')
              "
              :current-member="user"
              isAdaptiveSelect
              @update:assigness="
                (val) => {
                  return (issueSettings.assignees = val);
                }
              "
            ></SelectAssignee>
          </div>
        </div>

        <!-- Наблюдатели -->
        <div class="row q-pt-md centered-horisontally">
          <div class="col">
            <div class="row items-center">
              <ObserveIcon class="issue-icon" />
              <span class="q-ml-sm"> Наблюдатели </span>
            </div>
          </div>
          <div class="col flex rounded-borders issue-panel__q-select-wrapper">
            <SelectWatchers
              class="issue-selector"
              :projectid="props.project_id"
              :watchers="issueSettings.watchers"
              :current-member="user"
              isAdaptiveSelect
              :isDisabled="
                !hasPermissionByIssue(
                  issueData,
                  issueData.project_detail ?? project,
                  'change-issue-basic',
                )
              "
              @update:watchers="
                (val) => {
                  return (issueSettings.watchers = val);
                }
              "
            ></SelectWatchers>
          </div>
        </div>

        <!-- Приоритет -->
        <div class="row q-pt-md q-pb-md centered-horisontally">
          <div class="col">
            <div class="row items-center">
              <PriorityIcon class="issue-icon" />
              <span class="q-ml-sm"> Приоритет </span>
            </div>
          </div>
          <div class="col flex rounded-borders">
            <SelectPriority
              label="Приоритет"
              class="issue-selector"
              :workspace-slug="issueData.workspace_detail?.slug as string"
              :projectid="props.project_id"
              editIssue
              :priority="issueSettings.priority"
              isAdaptiveSelect
              :is-disabled="
                !hasPermissionByIssue(
                  issueData,
                  project,
                  'change-issue-primary',
                )
              "
              @update:priority="
                (val) => {
                  return (issueSettings.priority = val);
                }
              "
            >
            </SelectPriority>
          </div>
        </div>

        <q-separator class="issue-panel__separator" />

        <!-- Срок исполнения -->
        <div class="row q-pt-md centered-horisontally">
          <div class="col">
            <div class="row items-center">
              <ExecuteDateIcon :height="19" class="issue-icon" />
              <span class="q-ml-sm">Срок исполнения </span>
            </div>
          </div>
          <div class="col flex rounded-borders q-px-0">
            <SelectDate
              class="full-w"
              :workspace-id="issueData.workspace_detail?.slug as string"
              :project-id="issueData.project as string"
              :date="issueSettings.target_date"
              :issue="issueData"
              :is-disabled="
                !hasPermissionByIssue(
                  issueData,
                  project,
                  'change-issue-primary',
                )
              "
              :style="{ padding: 0 }"
              @update:date="
                (val) => {
                  return (issueSettings.target_date = val);
                }
              "
            />
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn
          flat
          no-caps
          label="Отмена"
          class="secondary-btn"
          v-close-popup
        />
        <q-btn
          flat
          no-caps
          label="Сохранить"
          class="primary-btn"
          @click="
            () => {
              isSave = true;
              dialogRef.hide();
            }
          "
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts" setup>
// core
import { storeToRefs } from 'pinia';
import { computed, ref, watch } from 'vue';
import { Screen } from 'quasar';

// components
import SelectStatus from 'src/components/SelectStatus.vue';
import SelectAssignee from 'components/selects/SelectAssignee.vue';
import SelectWatchers from 'components/selects/SelectWatchers.vue';
import SelectPriority from 'src/components/SelectPriority.vue';
import SelectDate from 'src/components/SelectDate.vue';

// components - icons
import UsersIcon from 'src/components/icons/UsersIcon.vue';
import ObserveIcon from 'src/components/icons/ObserveIcon.vue';
import PriorityIcon from 'src/components/icons/PriorityIcon.vue';
import CheckStatusIcon from 'src/components/icons/CheckStatusIcon.vue';
import ExecuteDateIcon from 'src/components/icons/ExecuteDateIcon.vue';

// stores
import { useRolesStore } from 'src/stores/roles-store';
import { useProjectStore } from 'src/stores/project-store';
import { useStatesStore } from 'src/stores/states-store';
import { useUserStore } from 'src/stores/user-store';
import {
  DtoIssue,
  DtoStateLight,
  DtoWorkspaceMember,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';

// store
const userStore = useUserStore();
const projectStore = useProjectStore();
const { hasPermissionByIssue } = useRolesStore();
const statesStore = useStatesStore();
const { statesCache } = storeToRefs(statesStore);

// store to refs
const { project } = storeToRefs(projectStore);
const { user } = storeToRefs(userStore);

const dynamicWidthDialog = computed(() =>
  Screen.width > 760 ? 400 : Screen.width * 0.9,
);

// props
const props = defineProps<{
  project_id: string;
  issue: DtoIssue;
  issue_settings: {
    state_detail: DtoStateLight;
    assignees: DtoWorkspaceMember[];
    watchers: DtoWorkspaceMember[];
    priority: string;
    target_date: string | null;
  };
}>();

// emits
const emit = defineEmits(['save']);

const dialogRef = ref();
const issueData = ref<DtoIssue>(props.issue);
const issueSettings = ref({
  state_detail: props.issue_settings.state_detail,
  priority: props.issue_settings.priority,
  target_date: props.issue_settings.target_date,
  assignees: props.issue_settings.assignees,
  watchers: props.issue_settings.watchers,
});

let isSave = ref(false);

// function
const resetSettings = () => {
  issueSettings.value = {
    state_detail: props.issue_settings.state_detail,
    priority: props.issue_settings.priority,
    target_date: props.issue_settings.target_date,
    assignees: props.issue_settings.assignees,
    watchers: props.issue_settings.watchers,
  };
};

const close = () => {
  if (isSave.value) {
    isSave.value = false;
    emit('save', issueSettings);
  } else {
    resetSettings();
  }
};

watch(
  () => props.issue_settings,
  () => resetSettings(),
);
</script>
