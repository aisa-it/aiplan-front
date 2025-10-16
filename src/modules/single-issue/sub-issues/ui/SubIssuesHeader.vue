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
    <div class="progress-w q-ml-sm full-w">
      <div style="bottom: 9px; position: absolute; width: 100%">
        <div class="row centered-horisontally justify-center">
          <q-badge
            class="progress-badge"
            :label="`Выполнено ${Math.round(done * 100)}%`"
          />
        </div>
      </div>
      <div class="progressbar row no-wrap items-stretch">
        <div
          v-if="cancelled()"
          class="line-wrapper"
          :style="`width: ${cancelled()}%`"
        >
          <div class="error-line" style="width: 100%">
            {{ '' }}
          </div>
        </div>
        <div
          v-if="completed()"
          class="line-wrapper"
          :style="`width: ${completed()}%`"
        >
          <div class="success-line" style="width: 100%">
            {{ '' }}
          </div>
        </div>
        <div
          v-if="started()"
          class="line-wrapper"
          :style="`width: ${started()}%`"
        >
          <div class="primary-line" style="width: 100%">{{ '' }}</div>
        </div>
      </div>
    </div>
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

function calculateSum(keys: string[]) {
  return (
    Object.entries(props.stateDistribution).reduce(function (acc, cur) {
      const [key, value] = cur;
      if (keys.includes(key)) {
        return acc + value;
      }
      return acc;
    }, 0) / props.subIssues.length
  );
}

const started = () => {
  return calculateSum(['started']) * 100;
};

const completed = () => {
  return calculateSum(['completed']) * 100;
};

const cancelled = () => {
  return calculateSum(['cancelled']) * 100;
};

const done = computed(() => calculateSum(['completed', 'cancelled']));

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
.progress-w {
  position: relative;
  border-radius: 8px;
}

@media screen and (max-width: 600px) {
  .progress-w {
    width: 100% !important;
  }
}
</style>
