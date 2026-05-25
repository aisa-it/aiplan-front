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
//core
import { storeToRefs } from 'pinia';
import { useRoute } from 'vue-router';
import { watch } from 'vue';

import { useWorkspaceStore } from 'src/stores/workspace-store';
import { useSingleIssueStore } from 'src/stores/single-issue-store';

//composables
import { useWorkspaceStoreV2 } from 'src/stores/workspace-store-v2';
import { useRolesStore } from 'src/stores/roles-store';

//api

//core
const route = useRoute();

//stores
const workspaceStore = useWorkspaceStore();
const rolesStore = useRolesStore();
const singleIssueStore = useSingleIssueStore();

const { workspaceInfo, currentWorkspaceSlug, meInWorkspace } =
  storeToRefs(workspaceStore);
const { issueData, currentIssueID } = storeToRefs(singleIssueStore);
const { workspace } = storeToRefs(useWorkspaceStoreV2());

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

watch(
  () => workspace?.value,
  () => {
    workspaceInfo.value = workspace.value;
    currentWorkspaceSlug.value = workspace?.value?.slug;
    workspaceStore.getMeInWorkspace(currentWorkspaceSlug.value);
    rolesStore.defineWorkspaceRole(meInWorkspace.value);
  },
  { immediate: true },
);
</script>
