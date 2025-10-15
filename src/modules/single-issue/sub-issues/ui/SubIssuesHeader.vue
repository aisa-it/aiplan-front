<template>
  <IssuesHeaderWrapper>
    <div class="flex no-wrap">
      <ToggleExpansionButton v-model="expanded" class="q-mr-sm" />
      <h6 class="flex items-center no-wrap" style="margin: 0px !important">
        Подзадачи
        <IssuesColorCountTitle
          :count="props.subIssues.length"
          :badgeClass="'circle-badge-issue'"
        />
      </h6>
    </div>
    <StatusLinearProgressBar
      v-if="props.stateDistribution"
      class="q-ml-sm"
      :issues="props.subIssues"
      :stateDistribution="props.stateDistribution"
    />
    <AddSubIssueButton
      :projectid="route.params.project"
      :issueid="currentIssueID"
      :isDisabled="props.isDisabled"
      @refresh="refresh()"
    ></AddSubIssueButton>
  </IssuesHeaderWrapper>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import IssuesColorCountTitle from 'src/components/IssuesColorCountTitle.vue';
import AddSubIssueButton from './AddSubIssueButton.vue';
import ToggleExpansionButton from 'src/components/buttons/ToggleExpansionButton.vue';
import IssuesHeaderWrapper from 'src/modules/single-issue/ui/components/IssuesHeaderWrapper.vue';
import StatusLinearProgressBar from 'src/components/progress-bars/StatusLinearProgressBar.vue';
import { useSingleIssueStore } from 'src/stores/single-issue-store';
import { storeToRefs } from 'pinia';

const route = useRoute();

const props = defineProps<{
  subIssues: any[];
  stateDistribution: Record<string, number>;
  isDisabled: boolean;
  isExpanded: boolean;
}>();

const expanded = computed({
  get: () => props.isExpanded,
  set: (val: boolean) => emits('update:isExpanded', val),
});

const emits = defineEmits(['refresh', 'update:isExpanded']);

const singleIssueStore = useSingleIssueStore();
const { currentIssueID } = storeToRefs(singleIssueStore);

const refresh = () => {
  emits('refresh');
};
</script>

<style scoped lang="scss">
.sub-issues-header {
  gap: 10px;
  width: 100%;
  padding: 0px !important;
}
</style>
