<template>
  <IssuesExpansionItem v-if="subIssues?.length > 0" v-model="isExpanded">
    <template v-slot:header>
      <SubIssuesHeader
        :project="project"
        :projectid="projectid"
        :sub-issues="subIssues"
        :state-distribution="stateDistribution"
        :is-disabled="isDisabled"
        v-model:isExpanded="isExpanded"
        @refresh="refresh()"
      />
    </template>
    <SubIssues
      :project_detail="project"
      :subIssues="subIssues"
      :manual-sort-mode="manualSortMode"
      @refresh="refresh()"
      @toggle-sort-mode="(value) => toggleSort(value)"
    />
  </IssuesExpansionItem>
  <q-item
    v-else
    class="row justify-between centered-horisontally"
    :style="'width: 100%; gap:10px; padding: 8px'"
  >
    <h6 class="flex items-center no-wrap" style="margin: 0px !important">
      Подзадачи
      <IssuesColorCountTitle
        :count="subIssues?.length"
        :badgeClass="'circle-badge-issue'"
      />
    </h6>
    <AddSubIssueButton
      :project="project"
      :projectid="projectid"
      :issueid="issueid"
      :isDisabled="isDisabled"
      @refresh="refresh()"
    ></AddSubIssueButton>
  </q-item>
</template>

<script lang="ts" setup>
// core
import { storeToRefs } from 'pinia';
import { onMounted, ref, onBeforeUnmount } from 'vue';

// stores
import { getSubIssues } from 'src/modules/single-issue/sub-issues/services/api';
// constants

// components
import IssuesColorCountTitle from 'src/components/IssuesColorCountTitle.vue';
import SubIssuesHeader from './SubIssuesHeader.vue';
import SubIssues from './SubIssues.vue';
import { useRoute } from 'vue-router';
import AddSubIssueButton from 'src/modules/single-issue/sub-issues/ui/AddSubIssueButton.vue';
import IssuesExpansionItem from 'src/modules/single-issue/ui/components/IssuesExpansionItem.vue';
import { useSingleIssueStore } from 'src/stores/single-issue-store';

import { setIntervalFunction } from 'src/utils/helpers';
import { DtoProject } from '@aisa-it/aiplan-api-ts/src/data-contracts';

const props = defineProps<{
  project?: DtoProject;
  projectid: string | null;
  issueid: string;
  isDisabled: {
    type: Boolean;
    required: false;
    default: () => false;
  };
}>();

//core
const route = useRoute();

//store
const singleIssueStore = useSingleIssueStore();
const { currentIssueID } = storeToRefs(singleIssueStore);

//refs
const subIssues = ref();
const stateDistribution = ref();
const manualSortMode = ref(false);
const isExpanded = ref(true);

//methods
const refresh = async () => {
  if (!currentIssueID.value) return;
  const { data } = await getSubIssues(
    route.params.workspace as string,
    props.projectid ?? (route.params.project as string),
    currentIssueID.value,
    manualSortMode.value,
  );

  subIssues.value = data?.sub_issues;
  stateDistribution.value = data?.state_distribution;
};

const toggleSort = async (value: boolean) => {
  manualSortMode.value = value;
  await refresh();
};

const refreshCycle = ref();

onMounted(() => {
  refresh();
  refreshCycle.value = setIntervalFunction(refresh);
});
onBeforeUnmount(() => {
  clearInterval(refreshCycle.value);
});
</script>
