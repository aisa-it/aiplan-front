<template>
  <div>
    <div class="row issue-list__header" :style="'padding: 12px 16px'">
      <IssuesListTitle />
      <q-space />

      <ProjectFiltersList :columns="projectStore.sortAllColumns" />
    </div>
    <q-tabs
      v-model="tab"
      dense
      class="text-grey q-mb-sm"
      active-color="primary"
      indicator-color="primary"
      align="left"
    >
      <q-tab name="general" label="Основные" />
      <q-tab name="pinned" label="Закрепленные задачи" />
      <q-tab name="analytics" label="Аналитика" />
    </q-tabs>

    <q-tab-panels v-model="tab" keep-alive>
      <q-tab-panel
        name="general"
        style="min-height: 80vh; height: 100%; overflow-y: hidden"
      >
        <IssueList />
      </q-tab-panel>

      <q-tab-panel name="pinned">
        <q-card-section>
          <PinnedIssueList :projectId="project.id" />
        </q-card-section>
      </q-tab-panel>
      <q-tab-panel name="analytics">
        <q-card-section>
          <AnalyticsList :projectId="project.id"
        /></q-card-section>
      </q-tab-panel>
    </q-tab-panels>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

import { storeToRefs } from 'pinia';
import { useProjectStore } from 'src/stores/project-store';

import IssuesListTitle from 'src/components/IssuesListTitle.vue';
import ProjectFiltersList from 'src/modules/issue-list/components/ProjectFiltersList.vue';
import IssueList from 'src/modules/issue-list/IssueList.vue';
import PinnedIssueList from 'src/modules/issue-list/components/PinnedIssueList.vue';
import AnalyticsList from 'src/modules/issue-list/components/analytics/AnalyticsList.vue';

const projectStore = useProjectStore();
const { project } = storeToRefs(projectStore);
const tab = ref('general');
</script>

<style lang="scss" scoped>
:deep(.q-tab__label) {
  text-transform: none;
  font-size: 16px;
  letter-spacing: 0.5px;
}

:deep(.q-tab-panel) {
  padding: 0;
}
</style>
