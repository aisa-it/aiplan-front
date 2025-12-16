<template>
  <q-btn
    class="btn-sm full-w without-border"
    label="Выберите задачи"
    no-wrap
    no-caps
    :disable="isDisabled === false"
    @click="isBlockOpen = true"
  />
  <div
    v-if="issues?.length"
    style="flex: 1; max-height: 75px; overflow-y: scroll"
    class="column no-wrap q-mt-sm"
  >
    <q-chip
      v-for="ii in issues"
      style="width: 120px !important"
      class="self-center"
      clickable
      :key="ii.id"
      :disable="disableIssueItem(ii)"
      :removable="isDisabled"
      :label="getLabel(ii)"
      :title="getLabel(ii)"
      @click="handleClick(ii)"
      @update:modelValue="updateModelValue(ii)"
    />
  </div>
  <SelectIssueDialog
    v-model="isBlockOpen"
    :project="issueData.project_detail"
    :project-identifier="issueData.project_detail?.identifier"
    :loading="loading"
    :issues="issuesIds"
    multi
    :allAllowed="true"
    @refresh="onLoad"
    @multi-select="saveBlockIssues"
  />
</template>

<script setup lang="ts">
// core
import { storeToRefs } from 'pinia';
import { computed, inject, ref } from 'vue';

// store
import { useAiplanStore } from 'stores/aiplan-store';
import { useSingleIssueStore } from 'stores/single-issue-store';
import { useNotificationStore } from 'stores/notification-store';
import { useWorkspaceStore } from 'src/stores/workspace-store';

// components
import SelectIssueDialog from 'src/components/dialogs/IssueDialogs/SelectIssueDialog.vue';

// interfaces
import { IIssueSelectRequest } from 'src/interfaces/issues';

// composables
import { useLoad } from 'src/composables/useLoad';
import { EventBus } from 'quasar';

const props = withDefaults(
  defineProps<{
    workspaceId: string;
    projectid: string;
    issueid: string;
    issues?: any[];
    target?: string;
    isDisabled?: boolean;
  }>(),
  {
    issues: () => [],
    target: '_self',
  },
);
const emits = defineEmits<{ refresh: [] }>();

const api = useAiplanStore();
const singleIssueStore = useSingleIssueStore();
const workspaceStore = useWorkspaceStore();
const { setNotificationView } = useNotificationStore();

const bus = inject('bus') as EventBus;

const isBlockOpen = ref(false);
const { issueData, currentIssueID } = storeToRefs(singleIssueStore);
const { currentWorkspaceSlug } = storeToRefs(workspaceStore);
const nameDetail = ref('blocked_issue_detail');
const listDisableIssue = ref<any>({});

const issuesIds = computed(() =>
  props.issues.map((e: any) => e[nameDetail.value]?.id),
);

const saveBlockIssues = async (items) => {
  const data = { blocks_list: items };

  api
    .issuePartialUpdate(props.workspaceId, props.projectid, props.issueid, data)
    .then(() => {
      setNotificationView({ type: 'success', open: true });
      emits('refresh');
    });
};

const handleClick = (val: any) => {
  singleIssueStore.openIssue(val[nameDetail.value].sequence_id, props.target);
};

const updateModelValue = (val: any) => {
  const ids = props.issues
    .map((e: any) => e[nameDetail.value].id)
    .filter((e: string) => e != val[nameDetail.value].id);
  const data = { blocks_list: ids };
  listDisableIssue.value[val[nameDetail.value].id] = true;

  api
    .issuePartialUpdate(props.workspaceId, props.projectid, props.issueid, data)
    .then(() => {
      setNotificationView({ type: 'success', open: true });
      emits('refresh');
      delete listDisableIssue.value[val[nameDetail.value].id];
    })
    .catch(() => {
      listDisableIssue.value[val[nameDetail.value].id] = false;
    });
};

const getLabel = (val: any) => {
  return `${issueData.value.project_detail.identifier}-${
    val[nameDetail.value]?.sequence_id
  }`;
};

const disableIssueItem = (val: any) => {
  return !!listDisableIssue.value?.[val[nameDetail.value]?.id];
};

const onRequest = async (params: IIssueSelectRequest) => {
  await singleIssueStore
    .getAvailableBlockerIssues(
      currentWorkspaceSlug.value,
      props.projectid,
      currentIssueID.value,
      params,
    )
    .then(({ data }) => bus.emit('updateSelectIssue', data));
};

const { loading, onLoad } = useLoad(onRequest);
</script>
