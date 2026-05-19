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

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { onMounted, watch } from 'vue';

import { storeToRefs } from 'pinia';
import { useProjectStore } from 'src/stores/project-store';
import { useIssuesStore } from 'src/stores/issues-store';

const router = useRouter();
const projectStore = useProjectStore();
const issuesStore = useIssuesStore();
const { currentProjectID, isLoadProjectInfo } = storeToRefs(projectStore);

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
  isLoadProjectInfo.value = false;
};

onMounted(async () => await getCurrentProject());

watch(
  () => router.currentRoute.value.params.project,
  () => {
    issuesStore.$reset();
    projectStore.$reset();
  },
);
</script>
