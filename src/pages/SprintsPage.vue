<template>
  <q-page v-show="!isLoadProjectInfo">
    <router-view v-slot="{ Component, route }">
      <transition
        appear
        name="fade"
        enter-active-class="animated fadeIn"
        leave-active-class="animated fadeOut"
      >
        <component :is="Component" :key="route.path" />
      </transition>
    </router-view>
  </q-page>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router';
import { onMounted } from 'vue';

import { storeToRefs } from 'pinia';
import { useProjectStore } from 'src/stores/project-store';
import { useWorkspaceStore } from 'src/stores/workspace-store';
import { useViewPropsStore } from 'src/stores/view-props-store';
// import ProjectLoader from 'src/components/loaders/ProjectLoader.vue';

import { getSprints, createSprint } from 'src/modules/sprints/services/api';

const router = useRouter();
const projectStore = useProjectStore();
const workspaceStore = useWorkspaceStore();
const viewProps = useViewPropsStore();
const { currentProjectID, isLoadProjectInfo } = storeToRefs(projectStore);
const { currentWorkspaceSlug } = storeToRefs(workspaceStore);

const getCurrentProject = async () => {
  isLoadProjectInfo.value = true;
  currentProjectID.value = 'LED';

  await projectStore.getProjectInfo(
    router.currentRoute.value.params.workspace as string,
    'LED',
  );
  await projectStore.getMeInProject(
    router.currentRoute.value.params.workspace as string,
    'LED',
  );
  await viewProps.getProjectProps();
  isLoadProjectInfo.value = false;
};

onMounted(async () => {
  getCurrentProject();

  const res1 = await createSprint(
    router.currentRoute.value.params.workspace as string,
    { name: 'sprint_new' },
  );
  console.log(res1);

  const res2 = await getSprints(
    router.currentRoute.value.params.workspace as string,
  );
  console.log(res2);
});
</script>
