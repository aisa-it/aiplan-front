<template>
  <IssuesExpansionItem v-if="subIssues?.length > 0" v-model="isExpanded">
    <template v-slot:header>
      <SubIssuesHeader
        :sub-issues="subIssues"
        :state-distribution="stateDistribution"
        :is-disabled="isDisabled"
        v-model:isExpanded="isExpanded"
        @refresh="refresh()"
      />
    </template>
    <SubIssues
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
      :projectid="projectid"
      :issueid="issueid"
      :isDisabled="isDisabled"
      @refresh="refresh()"
    ></AddSubIssueButton>
  </q-item>
</template>

<script lang="ts">
// core
import { Screen } from 'quasar';
import { storeToRefs } from 'pinia';
import { defineComponent, onMounted, ref, onBeforeUnmount } from 'vue';

// stores
import { useUserStore } from 'src/stores/user-store';
import { getSubIssues } from 'src/modules/single-issue/sub-issues/services/api';
// constants

// components
import IssuesColorCountTitle from 'src/components/IssuesColorCountTitle.vue';
import SubIssuesHeader from './SubIssuesHeader.vue';
import SubIssues from './SubIssues.vue';
import { useRoute } from 'vue-router';
import AddSubIssueButton from 'src/modules/single-issue/sub-issues/ui/AddSubIssueButton.vue';
import IssuesExpansionItem from 'src/modules/single-issue/ui/components/IssuesExpansionItem.vue';

import { setIntervalFunction } from 'src/utils/helpers';

export default defineComponent({
  name: 'SelectChildren',
  props: {
    projectid: {
      type: String || null,
      required: true,
    },
    issueid: {
      type: String,
      required: true,
    },
    isDisabled: {
      type: Boolean,
      required: false,
      default: () => false,
    },
  },

  components: {
    AddSubIssueButton,
    IssuesColorCountTitle,
    SubIssuesHeader,
    SubIssues,
    IssuesExpansionItem,
  },
  setup() {
    const userStore = useUserStore();

    const route = useRoute();
    const { user } = storeToRefs(userStore);

    const subIssues = ref();
    const stateDistribution = ref();
    const manualSortMode = ref(false);
    const isExpanded = ref(true);

    const refresh = async () => {
      const { data } = await getSubIssues(
        route.params.workspace as string,
        route.params.project as string,
        route.params.issue as string,
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
    return {
      user,
      Screen,
      manualSortMode,
      refresh,
      toggleSort,
      subIssues,
      stateDistribution,
      isExpanded,
      IssuesExpansionItem,
    };
  },
});
</script>
