<template>
  <q-list dense>
    <NavPopupItem
      v-for="project in projects"
      :key="project.id"
      :title="project.name ?? ''"
      :subtitle="project.identifier"
      :emoji="project.emoji"
      :logo="project.logo"
      @select="toProjectPage(project)"
    />
    <q-separator />

    <q-item
      clickable
      v-ripple
      class="nav-popup__footer-link"
      :to="`/${currentWorkspaceSlug}/projects`"
      v-close-popup
    >
      Просмотр всех проектов
    </q-item>
  </q-list>
</template>

<script setup lang="ts">
// core
import { computed } from 'vue';
import { storeToRefs } from 'pinia';

// stores
import { useWorkspaceStore } from 'src/stores/workspace-store';

// components
import NavPopupItem from './NavPopupItem.vue';
import { DtoProjectLight } from '@aisa-it/aiplan-api-ts/src/data-contracts.ts';
import { useRolesStore } from 'src/stores/roles-store.ts';
import { useRoute, useRouter } from 'vue-router';
import { useNotificationStore } from 'src/stores/notification-store.ts';
import { BASE_ERROR_RULES } from 'src/constants/notifications.ts';

const { getProjectRole, getWsRole } = useRolesStore();
const workspaceStore = useWorkspaceStore();
const { currentWorkspaceSlug } = storeToRefs(workspaceStore);
const router = useRouter();
const route = useRoute();
const { setNotificationView } = useNotificationStore();

const projects = computed(
  () => workspaceStore.workspaceSummary?.projects ?? [],
);

const toProjectPage = (project: DtoProjectLight) => {
  if (project.id && !isAccessToProject(project.id)) {
    setNotificationView({
      type: 'error',
      customMessage: BASE_ERROR_RULES,
      open: true,
    });
    return;
  }
  router.push(`/${currentWorkspaceSlug.value}/projects/${project.identifier}`);
};

const isAccessToProject = (projectId: string) => {
  return (
    !!getProjectRole(projectId) ||
    getWsRole(route.params.workspace as string) === 15
  );
};
</script>
