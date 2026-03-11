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
      <q-tab name="general">
        <div class="row items-center no-wrap gap-8">
          <DotListIcon :class="{ 'q-mr-sm': q.platform.is.desktop }" />
          <p class="q-ma-none" v-if="q.platform.is.desktop">Основные</p>
        </div>
      </q-tab>
      <q-tab name="pinned">
        <div class="row items-center no-wrap gap-8">
          <PinIcon
            class="rotate-90"
            :class="{ 'q-mr-sm': q.platform.is.desktop }"
          />
          <p class="q-ma-none" v-if="q.platform.is.desktop">
            Закрепленные задачи
          </p>
        </div>
      </q-tab>
      <q-tab name="analytics">
        <div class="row items-center no-wrap gap-8">
          <AnalyticsIcon :class="{ 'q-mr-sm': q.platform.is.desktop }" />
          <p class="q-ma-none" v-if="q.platform.is.desktop">Аналитика</p>
        </div>
      </q-tab>
    </q-tabs>

    <q-tab-panels v-model="tab" keep-alive>
      <q-tab-panel name="general" style="min-height: 80vh; height: 100%">
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
import { useQuasar } from 'quasar';

import { storeToRefs } from 'pinia';
import { useProjectStore } from 'src/stores/project-store';

import IssuesListTitle from 'src/components/IssuesListTitle.vue';
import ProjectFiltersList from 'src/modules/issue-list/components/ProjectFiltersList.vue';
import IssueList from 'src/modules/issue-list/IssueList.vue';
import PinnedIssueList from 'src/modules/issue-list/components/PinnedIssueList.vue';
import AnalyticsList from 'src/modules/issue-list/components/analytics/AnalyticsList.vue';

import DotListIcon from 'src/components/icons/DotListIcon.vue';
import PinIcon from 'src/components/icons/PinIcon.vue';
import AnalyticsIcon from 'src/components/icons/AnalyticsIcon.vue';

const q = useQuasar();

const projectStore = useProjectStore();
const { project } = storeToRefs(projectStore);
const tab = ref('general');
</script>

<style lang="scss" scoped>
:deep(.q-tab__content) {
  text-transform: none;
  font-size: 16px;
  letter-spacing: 0.5px;
}

:deep(.q-tab-panel) {
  padding: 0;
}

:deep(.q-panel-parent),
:deep(.q-panel),
:deep(.q-tab-panel) {
  overflow: visible !important;
}
</style>
