<template>
  <q-page class="q-pa-md">
    <div
      v-if="hasPermission('create-project')"
      class="flex justify-between items-center"
    >
      <h4>Проекты</h4>
      <q-btn flat dense style="height: 20px">
        <q-icon name="add" dense size="18px" />
        <q-popup-proxy>
          <q-list>
            <q-item
              clickable
              @click="isProjectCreateOpen = !isProjectCreateOpen"
            >
              <q-item-section v-close-popup> Создать проект </q-item-section>
            </q-item>
            <q-item :clickable="!isDemo" @click="isImportOpen = true">
              <q-item-section v-close-popup> Импорт из Jira </q-item-section>
              <HintTooltip v-if="!isDemo">
                Функционал импорта из Jira доступен в полной версии
              </HintTooltip>
            </q-item>
          </q-list>
        </q-popup-proxy>
      </q-btn>
    </div>

    <h4 v-else>Проекты</h4>

    <ProjectsTable />

    <ImportJiraDialog v-if="!isDemo" v-model="isImportOpen" />
    <NewProjectDialog v-model="isProjectCreateOpen" />
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRolesStore } from 'src/stores/roles-store';

import NewProjectDialog from 'src/components/dialogs/NewProjectDialog.vue';
import ImportJiraDialog from 'src/modules/import-jira/ui/ImportJiraDialog.vue';
import ProjectsTable from 'src/modules/projects-table/components/ProjectsTable.vue';
import { useUtilsStore } from 'src/stores/utils-store';
import { storeToRefs } from 'pinia';

const { isDemo } = storeToRefs(useUtilsStore());
const { hasPermission } = useRolesStore();

const isImportOpen = ref(false);
const isProjectCreateOpen = ref(false);
</script>
