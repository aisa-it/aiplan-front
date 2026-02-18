<template>
  <q-page v-show="!isLoadProjectInfo">
    <div class="row issue-list__header" :style="'padding: 12px 16px'">
      <IssuesListTitle />
      <q-space />

      <ProjectFiltersList :columns="projectStore.sortAllColumns" />
    </div>
    <q-tabs
      v-model="tab"
      dense
      class="text-grey"
      active-color="primary"
      indicator-color="primary"
      align="left"
    >
      <q-tab name="general" label="Основные" />
      <q-tab name="pinned" label="Закрепленные задачи" />
    </q-tabs>

    <q-tab-panels v-model="tab" keep-alive>
      <q-tab-panel name="general" style="height: 90vh">
        <IssueList />
      </q-tab-panel>

      <q-tab-panel name="pinned">
        <q-card-section>
          <PinnedIssueList :projectId="project.id" />
        </q-card-section>
      </q-tab-panel>
    </q-tab-panels>
  </q-page>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router';
import { onMounted, ref } from 'vue';

import { storeToRefs } from 'pinia';
import { useProjectStore } from 'src/stores/project-store';
import { useViewPropsStore } from 'src/stores/view-props-store';

import IssuesListTitle from 'src/components/IssuesListTitle.vue';
import ProjectFiltersList from 'src/modules/issue-list/components/ProjectFiltersList.vue';
import IssueList from 'src/modules/issue-list/IssueList.vue';
import PinnedIssueList from 'src/modules/issue-list/components/PinnedIssueList.vue';

const router = useRouter();
const projectStore = useProjectStore();
const viewProps = useViewPropsStore();
const { currentProjectID, isLoadProjectInfo, project } =
  storeToRefs(projectStore);

const tab = ref('general');

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
