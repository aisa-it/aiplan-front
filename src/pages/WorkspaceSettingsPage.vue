<template>
  <q-page class="q-pa-md">
    <WorkspaceSettings />
  </q-page>
</template>

<script setup lang="ts">
// utils
import { useMeta } from 'quasar';
import { storeToRefs } from 'pinia';
import { watch, ref, onMounted } from 'vue';

// stores
import { useRolesStore } from 'stores/roles-store';

import { useWorkspaceStore } from 'src/stores/workspace-store';

// components
import WorkspaceSettings from 'src/modules/workspace-settings/ui/WorkspaceSettings.vue';
import { useRoute } from 'vue-router';

const metadata = ref({
  title: 'Загрузка...',
});

const workspaceStore = useWorkspaceStore();
const { hasPermissionByWorkspace } = useRolesStore();
const { workspaceInfo } = storeToRefs(workspaceStore);

const route = useRoute();

useMeta(() => {
  return {
    title: metadata.value.title,
  };
});

function setAnotherTitle(title: string) {
  metadata.value.title = `Настройки ${title}`;
}

onMounted(async () => {
  await workspaceStore.getWorkspaceInfo(route.params.workspace as string);

  if (hasPermissionByWorkspace(workspaceInfo?.value, 'ws-settings') === false) {
    window.location.href = '/access-denied';
  }
});

watch(
  () => workspaceInfo?.value,
  (newVal) => {
    if (newVal?.name) setAnotherTitle(workspaceInfo?.value?.name || '');
  },
);
</script>
