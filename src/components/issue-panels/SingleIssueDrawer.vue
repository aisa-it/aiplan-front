<template>
  <q-drawer
    show-if-above
    side="right"
    class="issue-side-drawer q-ml-sm issue-panel-card hide-scrollbar"
    :overlay="preview"
    :width="width"
  >
    <div class="col q-pb-sm q-px-sm">
      <div v-if="preview" class="row justify-end flex q-gutter-sm">
        <q-btn
          class="secondary-btn-only-icon"
          icon="open_in_full"
          @click="emits('open', issueData.id)"
        >
          <HintTooltip>Открыть</HintTooltip>
        </q-btn>
        <q-btn
          class="secondary-btn-only-icon"
          icon="close"
          @click="emits('update:modelValue', false)"
        >
          <HintTooltip>Закрыть</HintTooltip>
        </q-btn>
      </div>

      <SingleIssueButtons />

      <q-separator class="issue-panel__separator" />

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
            :projectid="issueData.project"
            :issueid="issueData.id"
            :issue="issueData"
            :status="issueData.state_detail"
            :isDisabled="
              !hasPermissionByIssue(issueData, project, 'change-issue-status')
            "
            :states-from-cache="statesCache[issueData?.project]"
            @set-status="(val) => (issueData.state_detail = val)"
          />
        </div>
      </div>

      <div class="row q-pt-md centered-horisontally">
        <div class="col">
          <div class="row items-center">
            <UserIcon class="issue-icon" /><span class="q-ml-sm"> Автор </span>
          </div>
        </div>
        <div
          class="col flex rounded-borders issue-panel__autor-label items-center no-wrap"
        >
          <AvatarImage
            :rounded="true"
            btnsize="10px"
            class="issue-panel-avatar"
            :tooltip="aiplan.UserName(issueData.author_detail).join(' ')"
            :text="
              [
                aiplan
                  .UserName(issueData.author_detail)[0]
                  ?.at(0)
                  ?.toUpperCase(),
                aiplan
                  .UserName(issueData.author_detail)[1]
                  ?.at(0)
                  ?.toUpperCase(),
              ].join(' ')
            "
            :image="issueData.author_detail.avatar_id"
            :member="issueData.author_detail"
            @click="
              $router.push({
                path: `/${currentWorkspaceSlug}/user-activities/${issueData.author_detail.id}`,
              })
            "
          />
          <div class="q-ml-sm wrapped-string">
            {{ aiplan.UserName(issueData.author_detail).join(' ') }}
          </div>
        </div>
      </div>

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
            :projectid="issueData.project"
            :issueid="issueData.id"
            :assigness="
              issueData.assignee_details.map((assignee) => {
                return { member: assignee };
              })
            "
            :isDisabled="
              !hasPermissionByIssue(issueData, project, 'change-issue-basic')
            "
            :current-member="user"
          ></SelectAssignee>
        </div>
      </div>

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
            :projectid="issueData.project"
            :issueid="issueData.id"
            :watchers="
              issueData.watcher_details.map((watcher) => {
                return { member: watcher };
              })
            "
            :current-member="user"
            :isDisabled="
              !hasPermissionByIssue(issueData, project, 'change-issue-basic')
            "
          ></SelectWatchers>
        </div>
      </div>

      <div class="row q-pt-md centered-horisontally">
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
            :workspace-slug="issueData.workspace_detail.slug"
            :projectid="issueData.project"
            editIssue
            :issueid="issueData.id"
            :priority="issueData.priority"
            :issue="issueData"
            :is-disabled="
              !hasPermissionByIssue(issueData, project, 'change-issue-primary')
            "
            @update:priority="(val) => (issueData.priority = val)"
          >
          </SelectPriority>
        </div>
      </div>

      <q-separator class="q-mt-md issue-panel__separator" />

      <div class="row q-pt-md centered-horisontally">
        <div class="col">
          <div class="row items-center">
            <CreateDateIcon :height="19" class="issue-icon" />
            <span class="q-ml-sm">Дата создания </span>
          </div>
        </div>
        <div class="col pseudo-btn">
          {{ formatDateTime(issueData.created_at) }}
        </div>
      </div>

      <div class="row q-pt-md centered-horisontally">
        <div class="col">
          <div class="row items-center">
            <ExecuteDateIcon :height="19" class="issue-icon" />
            <span class="q-ml-sm">Срок исполнения </span>
          </div>
        </div>
        <div class="col flex rounded-borders">
          <SelectDate
            class="full-w"
            :workspace-id="issueData.workspace_detail.slug"
            :projectid="issueData.project"
            :issueid="issueData.id"
            :date="issueData.target_date"
            :issue="issueData"
            :is-disabled="
              !hasPermissionByIssue(issueData, project, 'change-issue-primary')
            "
            @refresh="(val) => (issueData.target_date = val)"
          />
        </div>
      </div>

      <div class="row q-pt-md centered-horisontally">
        <div class="col">
          <div class="row items-center">
            <StartDateIcon :height="19" class="issue-icon" />
            <span class="q-ml-sm">Дата начала </span>
          </div>
        </div>
        <div class="col pseudo-btn">
          {{ getDate(issueData.start_date) }}
        </div>
      </div>

      <div class="row q-pt-md centered-horisontally">
        <div class="col">
          <div class="row items-center">
            <EndDateIcon :height="19" class="issue-icon" />
            <span class="q-ml-sm">Дата завершения</span>
          </div>
        </div>
        <div class="col pseudo-btn">
          {{ getDate(issueData.completed_at) }}
          <span
            v-if="issueData.target_date && issueData.completed_at"
            :class="[
              'q-ml-xs',
              getCompareDate < 0 ? 'text-negative' : 'text-positive',
            ]"
            >({{ getCompareText() }})</span
          >
        </div>
      </div>

      <div class="row q-pt-md centered-horisontally">
        <div class="col">
          <div class="row items-center">
            <ParentIcon class="issue-icon" />
            <span class="q-ml-sm"> Родитель </span>
          </div>
        </div>
        <div class="col flex rounded-borders no-wrap">
          <SelectParentIssue
            class="full-w"
            :projectid="issueData.project"
            :issueid="issueData.id"
            :issue="issueData.parent_detail"
            :project="project"
            :isDisabled="
              hasPermissionByIssue(issueData, project, 'change-issue-primary')
            "
            @refresh="refresh"
          ></SelectParentIssue>
          <q-btn
            v-if="
              issueData.parent_detail &&
              hasPermissionByIssue(issueData, project, 'change-issue-primary')
            "
            class="btn-only-icon-sm q-ml-xs"
            style="padding: 0 3px"
            @click="handleRemoveParentIssue"
            ><CloseIcon
          /></q-btn>
        </div>
      </div>

      <div class="row q-pt-md centered-horisontally">
        <div class="col">
          <div class="row items-center">
            <AlertIcon :color="'rgb(236, 177, 104)'" class="issue-icon" />
            <span class="q-ml-sm"> Блокирует </span>
          </div>
        </div>
        <div class="col flex rounded-borders column">
          <SelectBlockIssues
            :workspace-id="issueData.workspace"
            :projectid="issueData.project"
            :issueid="issueData.id"
            :issues="issueData.blocker_issues"
            :target="user.theme?.open_in_new ? '_blank' : '_self'"
            :isDisabled="
              hasPermissionByIssue(issueData, project, 'change-issue-primary')
            "
            @refresh="refresh"
          />
        </div>
      </div>

      <div class="row q-pt-md centered-horisontally">
        <div class="col">
          <div class="row items-center">
            <AlertIcon :color="'rgb(230, 111, 96)'" class="issue-icon" />
            <span class="q-ml-sm"> Заблокирована </span>
          </div>
        </div>
        <div class="col flex rounded-borders column">
          <SelectBlockedIssues
            :workspace-id="issueData.workspace"
            :projectid="issueData.project"
            :issueid="issueData.id"
            :issues="issueData.blocked_issues"
            :target="user.theme?.open_in_new ? '_blank' : '_self'"
            :isDisabled="
              hasPermissionByIssue(issueData, project, 'change-issue-primary')
            "
            @refresh="refresh"
          />
        </div>
      </div>

      <q-separator class="q-mt-md issue-panel__separator" />

      <SelectLinks
        :projectid="issueData.project"
        :issueid="issueData.id"
        :links="issueData.issue_link"
        :isDisabled="
          hasPermissionByIssue(issueData, project, 'change-issue-secondary')
        "
        @refresh="refresh"
      >
      </SelectLinks>
    </div>
  </q-drawer>
</template>
<script setup lang="ts">
// core
import { onMounted, onBeforeUnmount, ref, computed } from 'vue';
import { storeToRefs } from 'pinia';

// stores
import { useUserStore } from 'src/stores/user-store';
import { useRolesStore } from 'src/stores/roles-store';
import { useStatesStore } from 'src/stores/states-store';
import { useProjectStore } from 'src/stores/project-store';
import { useWorkspaceStore } from 'src/stores/workspace-store';
import { useSingleIssueStore } from 'src/stores/single-issue-store';
import { useNotificationStore } from 'src/stores/notification-store';

// utils
import aiplan from 'src/utils/aiplan';
import { formatDateTime, msToRussianTime } from 'src/utils/time';

// components - core
import AvatarImage from 'src/components/AvatarImage.vue';
import SingleIssueButtons from 'src/components/issue-panels/SingleIssueButtons.vue';

// components - selectors
import SelectDate from 'src/components/SelectDate.vue';
import SelectLinks from 'src/components/SelectLinks.vue';
import SelectStatus from 'src/components/SelectStatus.vue';
import SelectAssignee from 'components/selects/SelectAssignee.vue';
import SelectWatchers from 'components/selects/SelectWatchers.vue';
import SelectPriority from 'src/components/SelectPriority.vue';
import SelectParentIssue from 'src/components/SelectParentIssue.vue';
import SelectBlockIssues from 'src/components/SelectBlockIssues.vue';
import SelectBlockedIssues from '../SelectBlockedIssues.vue';

// components - icons
import UserIcon from 'src/components/icons/UserIcon.vue';
import AlertIcon from 'src/components/icons/AlertIcon.vue';
import UsersIcon from 'src/components/icons/UsersIcon.vue';
import CloseIcon from 'src/components/icons/CloseIcon.vue';
import ParentIcon from 'src/components/icons/ParentIcon.vue';
import ObserveIcon from 'src/components/icons/ObserveIcon.vue';
import PriorityIcon from 'src/components/icons/PriorityIcon.vue';
import CheckStatusIcon from 'src/components/icons/CheckStatusIcon.vue';
import CreateDateIcon from 'src/components/icons/CreateDateIcon.vue';
import ExecuteDateIcon from 'src/components/icons/ExecuteDateIcon.vue';
import StartDateIcon from 'src/components/icons/StartDateIcon.vue';
import EndDateIcon from 'src/components/icons/EndDateIcon.vue';

// constants
import { SUCCESS_UPDATE_DATA } from 'src/constants/notifications';

import { setIntervalFunction } from 'src/utils/helpers';

const props = defineProps<{
  width?: number;
  preview?: boolean;
}>();

const emits = defineEmits<{
  refresh: [];
  open: [id: string];
  'update:modelValue': [value: boolean];
}>();

// stores
const userStore = useUserStore();
const statesStore = useStatesStore();
const projectStore = useProjectStore();
const { hasPermissionByIssue } = useRolesStore();
const workspaceStore = useWorkspaceStore();
const singleIssueStore = useSingleIssueStore();
const { setNotificationView } = useNotificationStore();
// store to refs
const { user } = storeToRefs(userStore);
const { currentProjectID, project } = storeToRefs(projectStore);
const { statesCache } = storeToRefs(statesStore);

const { issueData } = storeToRefs(singleIssueStore);
const { currentWorkspaceSlug } = storeToRefs(workspaceStore);

const refreshCycle = ref();

// functions
const refresh = async () => {
  await singleIssueStore
    .getIssueDataById(
      currentWorkspaceSlug.value,
      currentProjectID.value,
      issueData.value.id,
    )
    .then((res) => {
      issueData.value.draft = res.data.draft;
      issueData.value.state_detail = res.data.state_detail;
      issueData.value.assignee_details = res.data.assignee_details;
      issueData.value.watcher_details = res.data.watcher_details;
      issueData.value.priority = res.data.priority;
      issueData.value.target_date = res.data.target_date;
      issueData.value.parent_detail = res.data.parent_detail;
      issueData.value.blocker_issues = res.data.blocker_issues;
      issueData.value.blocked_issues = res.data.blocked_issues;
      issueData.value.issue_link = res.data.issue_link;
    });
};

const handleRemoveParentIssue = async () => {
  await singleIssueStore
    .updateIssueData(
      currentWorkspaceSlug.value,
      currentProjectID.value,
      issueData.value.id,
      { parent: null },
    )
    .then(async () => {
      setNotificationView({
        type: 'success',
        open: true,
        customMessage: SUCCESS_UPDATE_DATA,
      });
      issueData.value.parent_detail = null;
    });
};

const getDate = (dateVal: string | null) => {
  return dateVal ? new Date(dateVal).toLocaleDateString() : 'Нет даты';
};

const getCompareDate = computed(() => {
  const completedDate = new Date(issueData.value.completed_at).getTime();
  const targetdDate = new Date(issueData.value.target_date).getTime();
  return targetdDate - completedDate;
});

const getCompareText = () => {
  const dateToDays = getCompareDate.value / 86400000;
  if (dateToDays === 0 || dateToDays > 9) {
    return 'в срок';
  } else if (dateToDays < -9) {
    return 'не в срок';
  } else {
    return `${dateToDays > 0 ? '+' : '-'}${msToRussianTime(
      Math.abs(getCompareDate.value),
    )}`;
  }
};

onMounted(() => {
  refreshCycle.value = setIntervalFunction(refresh);
});

onBeforeUnmount(() => {
  clearInterval(refreshCycle.value);
});
</script>

<style scoped lang="scss">
.issue-selector {
  max-width: 100%;
  min-width: 100%;
}

.wrapped-string {
  word-wrap: break-word;
  width: 80%;
  @media screen and (max-width: 420px) {
    width: 60%;
  }
}
</style>
