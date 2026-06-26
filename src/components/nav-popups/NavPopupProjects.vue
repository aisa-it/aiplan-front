<template>
  <q-menu
    anchor="top end"
    self="top start"
    :offset="[8, 0]"
    max-height="70vh"
    class="nav-popup"
  >
    <div
      class="text-caption text-weight-bold text-uppercase text-grey-7 q-pt-sm q-px-md q-pb-xs non-selectable shrink"
    >
      Проекты
    </div>
    <div class="scroll">
      <q-list dense>
        <NavPopupItem
          v-for="project in projects"
          :key="project.id"
          :title="project.name ?? ''"
          :subtitle="project.identifier"
          :emoji="project.emoji"
          :logo="project.logo"
          :active="route.params.project === project.identifier"
          @select="toProjectPage(project)"
        />
      </q-list>
    </div>
    <q-separator class="shrink" />

    <q-item
      dense
      clickable
      v-ripple
      class="shrink q-py-sm text-body2"
      :to="`/${currentWorkspaceSlug}/projects`"
      v-close-popup
    >
      <q-item-section>
        <div class="text-primary">Просмотр всех проектов</div></q-item-section
      >
    </q-item>
  </q-menu>
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
