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

const router = useRouter();
const projectStore = useProjectStore();
const workspaceStore = useWorkspaceStore();
const viewProps = useViewPropsStore();
const { currentProjectID, isLoadProjectInfo } = storeToRefs(projectStore);
const { currentWorkspaceSlug } = storeToRefs(workspaceStore);

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

onMounted(async () => getCurrentProject());
</script>
