<template>
  <q-page class="q-pa-md">
    <div
      v-if="hasPermission('create-sprint')"
      class="flex justify-between items-center"
    >
      <h4>
        Спринты
        {{ workspaceStore.currentWorkspaceSlug }}
      </h4>
      <q-btn flat dense style="height: 20px">
        <q-icon name="add" dense size="18px" />
        <q-popup-proxy>
          <q-list>
            <q-item
              clickable
              @click="isSprintCreateOpen = !isSprintCreateOpen"
            >
              <q-item-section v-close-popup> Создать спринт </q-item-section>
            </q-item>
          </q-list>
        </q-popup-proxy>
      </q-btn>
    </div>

    <h4 v-else>
      Спринты
      {{ workspaceStore.currentWorkspaceSlug }}
    </h4>

    <SprintsTable
      @refresh="refreshSprints"
    />

    <CreateSprintDialog
      v-model="isSprintCreateOpen"
      @update-sprints="refreshSprints"
    />
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRolesStore } from 'src/stores/roles-store';
import { useSprintStore } from 'src/modules/sprints/stores/sprint-store';
import { useWorkspaceStore } from 'src/stores/workspace-store';
import { useRoute } from 'vue-router';

import SprintsTable from 'src/modules/sprints/sprints-table/components/SprintsTable.vue';
import CreateSprintDialog from 'src/modules/sprints/create-sprint-dialog/CreateSprintDialog.vue';

const { hasPermission } = useRolesStore();
const sprintStore = useSprintStore();
const workspaceStore = useWorkspaceStore();
const route = useRoute();

const isSprintCreateOpen = ref(false);

const refreshSprints = async () => {
  await sprintStore.getSprintsList(route.params.workspace as string);
}

onMounted(async () => {
  refreshSprints();
});
</script>
