<template>
  <div class="nav-popup">
    <NavPopupSection title="Проекты">
      <q-list dense>
        <NavPopupItem
          v-for="project in projects"
          :key="project.id"
          :title="project.name ?? ''"
          :subtitle="project.identifier"
          :emoji="project.emoji"
          :logo="project.logo"
          :to="`/${currentWorkspaceSlug}/projects/${project.identifier}`"
        />
      </q-list>
    </NavPopupSection>
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
  </div>
</template>

<script setup lang="ts">
// core
import { computed } from 'vue';
import { storeToRefs } from 'pinia';

// stores
import { useWorkspaceStore } from 'src/stores/workspace-store';

// components
import NavPopupSection from './NavPopupSection.vue';
import NavPopupItem from './NavPopupItem.vue';

const workspaceStore = useWorkspaceStore();
const { currentWorkspaceSlug } = storeToRefs(workspaceStore);

const projects = computed(
  () => workspaceStore.workspaceSummary?.projects ?? [],
);
</script>
