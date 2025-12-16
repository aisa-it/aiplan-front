<template>
  <q-card
    class="column no-wrap issue-panel__comments-card flex-grow"
    flat
    :style="'position: relative; width: 100%'"
  >
    <div>
      <h6 class="q-px-sm">Активность</h6>
      <q-tabs
        v-model="tab"
        dense
        class="text-grey"
        active-color="primary"
        indicator-color="primary"
        align="left"
      >
        <q-tab name="comments" label="Комментарии" />
        <q-tab name="activity" label="Активность" />
        <q-tab name="statuses" label="Статусы" />
      </q-tabs>
    </div>

    <div class="full-w flex-grow">
      <transition name="fade-slide" mode="out-in">
        <q-tab-panels v-model="tab" class="full-height" keep-alive>
          <q-tab-panel ref="tabComments" name="comments">
            <SingleIssueActivityComments
              :members="props.members"
              @updateComponent="updateHeight"
            />
          </q-tab-panel>
          <q-tab-panel ref="tabActivity" name="activity">
            <SelectActivity
              type="tasks"
              :activitiesData="issueActivitiesData"
              @updateComponent="updateHeight"
              @refreshData="getActivityData"
            />
          </q-tab-panel>
          <q-tab-panel ref="tabStatuses" name="statuses">
            <IssueStatusHistoryTab
              :projectid="issueData?.project"
              @updateComponent="updateHeight"
            />
          </q-tab-panel>
        </q-tab-panels>
      </transition>
    </div>
  </q-card>
</template>
<script lang="ts" setup>
// core
import { nextTick, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';

// store
import { useSingleIssueStore } from 'stores/single-issue-store';

// components
import SelectActivity from 'src/components/SelectActivity.vue';
import IssueStatusHistoryTab from 'src/components/IssueStatusHistoryTab.vue';
import SingleIssueActivityComments from 'components/issue-panels/SingleIssueActivityComments.vue';
import { DtoProjectMember } from '@aisa-it/aiplan-api-ts/src/data-contracts';

// stores
const singleIssueStore = useSingleIssueStore();
// store to refs
const { issueActivitiesData, issueData } = storeToRefs(singleIssueStore);

const props = defineProps<{ members?: DtoProjectMember[] }>();

//vars
const tab = ref('comments');
const wrapperStyle = ref({ height: '0', transition: 'height 0.7s ease' });
const tabComments = ref();
const tabActivity = ref();
const tabStatuses = ref();

const updateHeight = async () => {
  await nextTick();
  let newHeight = 0;

  if (tab.value === 'comments') {
    newHeight = tabComments.value?.$el.offsetHeight;
  } else if (tab.value === 'activity') {
    newHeight = tabActivity.value?.$el.offsetHeight;
  } else if (tab.value === 'statuses') {
    newHeight = tabStatuses.value?.$el.offsetHeight;
  }

  wrapperStyle.value.height = `${newHeight}px`;
};

const getActivityData = async (page: number, pageSize: number) => {
  await singleIssueStore.getIssueActivitiesList(
    page,
    pageSize,
    undefined,
    issueData.value?.project,
  );
};

watch(
  tab,
  () => {
    updateHeight();
  },
  {
    immediate: true,
  },
);
</script>

<style lang="scss" scoped>
.q-tab-panels.q-panel-parent {
  width: 100%;
}

:deep(.q-tab-panel) {
  padding: 0;
}
</style>
