<template>
  <div
    v-if="viewProps.props.filters.group_by === 'State'"
    class="horizontal-scroll-enable flex flex-col gap-x-4 q-pa-sm bg-[transparent] items-start all-boards"
  >
    <IssuesSingleBoard
      v-for="(state, index) in projectIssuesStates"
      :all-issues="[]"
      :key="index"
      :id="state.id"
      :group-by="viewProps.props.filters.group_by"
      :stateOrLabelInfo="state"
      :projectid="project_id"
      :searchValue="''"
      :show-empty-group="viewProps.props.showEmptyGroups"
      class="q-mb-md flex-shrink-0"
      :style="'height: calc(100% - 16px)'"
    />
  </div>

  <div
    v-else-if="viewProps.props.filters.group_by === 'Label'"
    class="horizontal-scroll-enable flex flex-col h-screen gap-x-4 q-pa-sm bg-[transparent] items-start all-boards"
  >
    <IssuesSingleBoard
      v-for="label in projectIssuesLabels"
      :key="label.id"
      :id="label.id"
      :group-by="viewProps.props.filters.group_by"
      :stateOrLabelInfo="label"
      :projectid="project_id"
      :searchValue="''"
      :show-empty-group="viewProps.props.showEmptyGroups"
      class="q-mb-md flex-shrink-0 h-screen"
      :style="'height: calc(100% - 16px)'"
    />
    <IssuesSingleBoard
      :id="''"
      :group-by="viewProps.props.filters.group_by"
      :stateOrLabelInfo="undefined"
      :projectid="project_id"
      :searchValue="''"
      :show-empty-group="viewProps.props.showEmptyGroups"
      class="q-mb-md flex-shrink-0 h-screen"
      :style="'height: calc(100% - 16px)'"
    />
  </div>

  <div
    v-else-if="viewProps.props.filters.group_by === 'Priority'"
    class="horizontal-scroll-enable flex flex-col h-screen gap-x-4 q-pa-sm bg-[transparent] items-start all-boards"
  >
    <IssuesSingleBoard
      v-for="priority in ['urgent', 'high', 'medium', 'low', '']"
      :key="priority"
      :id="priority"
      :group-by="viewProps.props.filters.group_by"
      :stateOrLabelInfo="{
        name:
          translatePrioritets(priority).charAt(0).toUpperCase() +
          translatePrioritets(priority).slice(1),
        color: '#000000',
      }"
      :projectid="project_id"
      :searchValue="''"
      :show-empty-group="viewProps.props.showEmptyGroups"
      class="q-mb-md flex-shrink-0 h-screen"
      :style="'height: calc(100% - 16px)'"
    />
  </div>

  <div
    v-else-if="viewProps.props.filters.group_by !== 'None'"
    :key="viewProps.props.filters.group_by"
    class="horizontal-scroll-enable flex flex-col h-screen gap-x-4 q-pa-sm bg-[transparent] items-start all-boards"
  >
    <IssuesSingleBoard
      v-for="member in projectIssuesMembers"
      :key="member.id"
      :id="member.member.id"
      :group-by="viewProps.props.filters.group_by"
      :member="member.member"
      :projectid="project_id"
      :searchValue="''"
      :show-empty-group="viewProps.props.showEmptyGroups"
      class="q-mb-md flex-shrink-0 h-screen"
      :style="'height: calc(100% - 16px)'"
    />
    <IssuesSingleBoard
      :id="''"
      :group-by="viewProps.props.filters.group_by"
      :member="undefined"
      :projectid="project_id"
      :searchValue="''"
      :show-empty-group="viewProps.props.showEmptyGroups"
      class="q-mb-md flex-shrink-0 h-screen"
      :style="'height: calc(100% - 16px)'"
    />
  </div>

  <div
    v-else
    class="horizontal-scroll-enable flex flex-col h-screen gap-x-4 q-pa-sm bg-[transparent] items-start all-boards"
  >
    <IssuesSingleBoard
      :all-issues="allIssues"
      :id="''"
      :group-by="viewProps.props.filters.group_by"
      :member="undefined"
      :projectid="project_id"
      :searchValue="''"
      :show-empty-group="viewProps.props.showEmptyGroups"
      class="q-mb-md flex-shrink-0 h-screen"
      :style="'height: calc(100% - 16px)'"
    />
  </div>
</template>

<script setup lang="ts">
// core
import { useRoute } from 'vue-router';
import { ref, toRef, watch } from 'vue';
import { useViewPropsStore } from 'src/stores/view-props-store';

// services
import { translatePrioritets } from 'src/utils/translator';

//components
import IssuesSingleBoard from 'src/components/IssuesSingleBoard.vue';

const props = defineProps<{
  issues: any[];
  projectStates?: any[];
  projectLabels?: any[];
  projectMembers?: any[];
}>();

const route = useRoute();
const viewProps = useViewPropsStore();
const project_id = ref(route.params.workspace);

const allIssues = toRef(props.issues);
const projectIssuesStates = toRef(props.projectStates);
const projectIssuesLabels = toRef(props.projectLabels);
const projectIssuesMembers = toRef(props.projectMembers);

// props watchers
watch(
  () => props.issues,
  () => (allIssues.value = props.issues),
);
watch(
  () => props.projectStates,
  () => (projectIssuesStates.value = props.projectStates),
);
watch(
  () => props.projectLabels,
  () => (projectIssuesLabels.value = props.projectLabels),
);
watch(
  () => props.projectMembers,
  () => (projectIssuesMembers.value = props.projectMembers),
);
</script>
<style lang="scss">
.all-boards {
  position: relative;
  height: calc(100vh - 120px);
}
</style>
