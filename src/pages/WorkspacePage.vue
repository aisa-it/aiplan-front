<template>
  <q-page>
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
import { storeToRefs } from 'pinia';
import { useRoute } from 'vue-router';
import { useRouter } from 'vue-router';
import { ref, watch, onMounted, onBeforeMount } from 'vue';

import { useFormStore } from 'src/stores/form-store';
import { useStatesStore } from 'src/stores/states-store';
import { useProjectStore } from 'src/stores/project-store';
import { useWorkspaceStore } from 'src/stores/workspace-store';
import { useSingleIssueStore } from 'src/stores/single-issue-store';

import { sortStates } from 'src/utils/sort';
import { appVisibleTimeout } from 'src/utils/visibilityApp';
import { stopGlobalLoading } from 'src/composables/useGlobalLoader';

const formStore = useFormStore();
const workspaceStore = useWorkspaceStore();

const statesStore = useStatesStore();
const projectStore = useProjectStore();
const singleIssueStore = useSingleIssueStore();

const { project } = storeToRefs(projectStore);
const { currentWorkspaceSlug, workspaceInfo } = storeToRefs(workspaceStore);
const { issueData, currentIssueID } = storeToRefs(singleIssueStore);

const route = useRoute();
const router = useRouter();

const startLoader = ref(true);

const refresh = async () => {
  if (!route.params.project) project.value = null;

  if (!route.params.workspace || route.params.workspace === 'undefined') return;

  currentWorkspaceSlug.value = route.params.workspace as string;
  const slug = route.params.workspace as string;

  try {
    await workspaceStore.getWorkspaceInfo(slug);
  } catch (e: any) {
    stopGlobalLoading();

    if (e?.response.status === 403) return router.push('/access-denied');
  }

  await Promise.all([
    workspaceStore.getWorkspaceMembers(slug),
    workspaceStore.getWorkspaceProjects(slug),
  ]);

  if (
    workspaceInfo.value.current_user_membership &&
    workspaceInfo.value.current_user_membership?.role === 15
  ) {
    await formStore.getFormList(slug);
  } else formStore.resetForms();

  await workspaceStore
    .getAllWorkspaceStates(currentWorkspaceSlug.value)
    .then(() => {
      let obj = {};
      for (let o in workspaceStore.allWorkspaceStates) {
        obj[o] = sortStates(workspaceStore.allWorkspaceStates[o]);
      }
      statesStore.statesCache = obj;
    });
  stopGlobalLoading();
};
const refreshAfterVisible = async () => {
  startLoader.value = true;
  if (router.currentRoute.value.fullPath.includes('settings')) {
    startLoader.value = false;
  }
  await refresh();
};

onBeforeMount(async () => {
  appVisibleTimeout(() => refreshAfterVisible());
  // if (!route.params.project) loaderStore.startLoading();

  await refresh();
});

watch(
  () => route.params.issue,
  () => {
    if (!route.params.issue) {
      issueData.value = null;
      currentIssueID.value = '';
    }
  },
  { immediate: true },
);
</script>
