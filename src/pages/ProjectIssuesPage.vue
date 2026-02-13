<template>
  <q-page v-show="!isLoadProjectInfo" class="project-page">
    <IssuesListTitle style="padding: 16px" />
    <div class="flex justify-between">
      <q-tabs
        v-model="tab"
        dense
        class="text-grey"
        active-color="primary"
        indicator-color="primary"
        align="left"
        no-caps
        @update:model-value="router.replace({ name: tab })"
      >
        <q-tab name="issues" label="Основные" />
        <q-tab name="pinned_issues" label="Закрепленные задачи" />
        <q-tab name="analytics" label="Аналитика" />
      </q-tabs>

      <project-filters-list :columns="projectStore.sortAllColumns" />
    </div>

    <q-tab-panels v-model="tab" keep-alive>
      <q-tab-panel name="issues">
        <IssueList />
      </q-tab-panel>
      <q-tab-panel name="pinned_issues">
        <PinnedIssueList />
      </q-tab-panel>
    </q-tab-panels>
  </q-page>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router';
import { computed, onMounted, ref, watch } from 'vue';

import { storeToRefs } from 'pinia';
import { useProjectStore } from 'src/stores/project-store';
import { useViewPropsStore } from 'src/stores/view-props-store';
import IssuesListTitle from 'src/components/IssuesListTitle.vue';
import IssueList from 'src/modules/issue-list/IssueList.vue';
import ProjectFiltersList from 'src/modules/issue-list/components/ProjectFiltersList.vue';
import PinnedIssueList from 'src/modules/issue-list/components/PinnedIssueList.vue';

const router = useRouter();
const projectStore = useProjectStore();
const viewProps = useViewPropsStore();
const { currentProjectID, isLoadProjectInfo } = storeToRefs(projectStore);

const tab = ref('issues');

const getCurrentProject = async () => {
  isLoadProjectInfo.value = true;
  currentProjectID.value = router.currentRoute.value.params.project as string;

  await projectStore.getProjectInfo(
    router.currentRoute.value.params.workspace as string,
    router.currentRoute.value.params.project as string,
  );
  await projectStore.getMeInProject(
    router.currentRoute.value.params.workspace as string,
    router.currentRoute.value.params.project as string,
  );
  await viewProps.getProjectProps();
  isLoadProjectInfo.value = false;
};

onMounted(async () => await getCurrentProject());

watch(
  () => router.currentRoute.value.name,
  () => {
    if (
      !router.currentRoute.value.name ||
      router.currentRoute.value.name === tab.value
    )
      return;

    tab.value = String(router.currentRoute.value.name);
  },
  { immediate: true },
);
</script>

<style lang="scss">
.q-tab__label {
  font-size: 16px !important;
}

.q-tab-panel {
  padding: 0px !important;
}
</style>
