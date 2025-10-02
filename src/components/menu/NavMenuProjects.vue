<template>
  <ExpansionItem full-open is-default-open itemName="project">
    <template v-slot:header>
      <div class="row centered-horisontally justify-between full-w">
        <q-item-section avatar>
          <MenuProjectsIcon :is-dark="$q.dark.isActive" />
        </q-item-section>
        <q-item-section>Проекты</q-item-section>
        <NavAddProjectButton v-if="hasPermission('create-project')" />
      </div>
    </template>
    <template v-slot:content>
      <q-list
        v-if="workspaceProjects.length > 0 || workspaceInfo"
        :style="{
          overflow: 'scroll',
        }"
        class="scrollable-content"
      >
        <MenuLink
          v-for="project in sortedWorkspaceProjects"
          :key="project.id"
          :emoji="project.emoji ?? ''"
          :link="`/${currentWorkspaceSlug || workspaceInfo?.slug}/projects/${
            project.identifier
          }/issues`"
          :title="project.name"
          :id="project.id"
          :identifier="project.identifier"
          :favorite="project.is_favorite"
          :project="project"
          :workspace-slug="currentWorkspaceSlug"
          :logo="project.logo ?? null"
        />
      </q-list>
    </template>
  </ExpansionItem>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia';
import { useWorkspaceStore } from 'src/stores/workspace-store';
import { useRolesStore } from 'src/stores/roles-store';
import { computed } from 'vue';
import ExpansionItem from '../ExpansionItem.vue';

import MenuLink from 'src/components/MenuLink.vue';
import NavAddProjectButton from './NavAddProjectButton.vue';
import MenuProjectsIcon from '../icons/MenuProjectsIcon.vue';

// stores
const workspaceStore = useWorkspaceStore();
const { hasPermission } = useRolesStore();

// store to refs
const { workspaceInfo, workspaceProjects, currentWorkspaceSlug } =
  storeToRefs(workspaceStore);

const sortedWorkspaceProjects = computed(() =>
  [...workspaceProjects.value].sort((a, b) =>
    b.is_favorite === a.is_favorite ? 0 : b.is_favorite ? 1 : -1,
  ),
);
</script>
