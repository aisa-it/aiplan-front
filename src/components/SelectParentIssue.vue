<template>
  <q-btn
    :class="`btn-sm full-w without-border ${newIssue ? 'new-issue-btn' : ''}`"
    no-wrap
    no-caps
    :disable="isDisabled === false"
    @click="isParentOpen = true"
  >
    <div class="row justify-between centered-horisontally no-wrap">
      <span class="abbriviated-text">
        {{ parentName }}
      </span>
    </div>
    <SelectIssueDialog
      v-model="isParentOpen"
      :projectIdentifier="project?.identifier"
      :project="props.project"
      :issues="[issue].map((el) => el?.id)"
      :loading="loading"
      :chip="newIssue ? null : issue"
      @refresh="onLoad"
      @single-select="saveParentIssue"
    />
  </q-btn>
</template>

<script setup lang="ts">
// core
import { storeToRefs } from 'pinia';
import { computed, inject, ref, watch } from 'vue';
import { EventBus } from 'quasar';
// store
import { useAiplanStore } from 'src/stores/aiplan-store';
import { useWorkspaceStore } from 'stores/workspace-store';
import { useNotificationStore } from 'src/stores/notification-store';
import { useIssuesStore } from 'src/stores/issues-store';
import { useSingleIssueStore } from 'src/stores/single-issue-store';

// components
import SelectIssueDialog from 'src/components/dialogs/IssueDialogs/SelectIssueDialog.vue';

// constants
import { API_WORKSPACES_PREFIX } from 'src/constants/apiPrefix';

// interfaces
import { IIssueSelectRequest } from 'src/interfaces/issues';
import { IProject } from 'src/interfaces/projects';

// composables
import { useLoad } from 'src/composables/useLoad';

const props = defineProps<{
  projectid: string;
  issueid?: string;
  issue?: any;
  project: IProject;
  isDisabled?: boolean;
  newIssue?: boolean;
}>();

const emits = defineEmits<{
  refresh: [];
  'update:issue': [issue: any | null];
}>();

const api = useAiplanStore();
const issueStore = useSingleIssueStore();
const issuesStore = useIssuesStore();
const workspaceStore = useWorkspaceStore();
const { setNotificationView } = useNotificationStore();

const bus = inject('bus') as EventBus;

// используем при сбросе чипа с родительской задачей, для рефреша списка с той же пагинацией и поиском
const oldParams = ref<IIssueSelectRequest>();
const isParentOpen = ref(false);

const { currentWorkspaceSlug } = storeToRefs(workspaceStore);
const { currentIssueID } = storeToRefs(issueStore);

const saveParentIssue = (issue: any, extendedIssue?: any) => {
  if (props.issueid)
    api
      .issuePartialUpdate(
        currentWorkspaceSlug.value,
        props.projectid,
        props.issueid,
        {
          parent: issue,
        },
      )
      .then(() => {
        setNotificationView({ type: 'success', open: true });
        emits('refresh');
        onLoad();
      });
  else emits('update:issue', issue && props.newIssue ? extendedIssue : null);
};

const parentName = computed(() => {
  const sequenceId = props.issue?.sequence_id;

  if (!!sequenceId) {
    const projectIdentifier = props.project?.identifier;
    const identifier = projectIdentifier
      ? projectIdentifier
      : api.currentProject.identifier;

    return `${identifier}-${sequenceId}`;
  }

  return props.newIssue ? 'Выберите родителя' : 'Родитель';
});

const onRequest = async (params: IIssueSelectRequest) => {
  if (params) oldParams.value = params;
  if (props.newIssue) {
    const url = `${API_WORKSPACES_PREFIX}/${workspaceStore.currentWorkspaceSlug}/projects/${props.projectid}/issues/search/`;
    const filters = {
      search_query: params.search_query,
      only_active: false,
      authors:
        props.project?.current_user_membership?.role !== 15
          ? [props.project?.current_user_membership?.member_id]
          : [],
    };
    const { offset, limit, order_by, desc } = params;
    await issuesStore
      .getIssues(url, { offset, limit, order_by, desc }, filters)
      .then((res) => {
        bus.emit('updateSelectIssue', {
          result: res?.rows,
          count: res?.pagination.rowsNumber,
          limit: res?.pagination.rowsPerPage,
        });
      });
  } else {
    await issueStore
      .getAvailableParentIssues(
        currentWorkspaceSlug.value,
        props.projectid as string,
        currentIssueID.value,
        params ?? oldParams.value,
      )
      .then(({ data }) => bus.emit('updateSelectIssue', data));
  }
};

const { loading, onLoad } = useLoad(onRequest);

watch(
  () => props.projectid,
  () => {
    emits('update:issue', null);
  },
);
</script>
