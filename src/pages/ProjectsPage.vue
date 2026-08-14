<template>
  <q-page class="q-pa-md">
    <div
      v-if="hasPermission('create-project')"
      class="flex justify-between items-center"
    >
      <h4>Проекты</h4>
      <NavAddProjectButton />
    </div>

    <h4 v-else>Проекты</h4>

    <ProjectsTable />
  </q-page>
</template>

<script setup lang="ts">
import { useRolesStore } from 'src/stores/roles-store';

import NavAddProjectButton from 'src/components/menu/NavAddProjectButton.vue';
import ProjectsTable from 'src/modules/projects-table/components/ProjectsTable.vue';

const { hasPermission } = useRolesStore();
</script>
