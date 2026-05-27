<template>
  <q-page class="q-pa-md">
    <div
      v-if="hasPermission('create-sprint')"
      class="flex justify-between items-center"
    >
      <h4>Спринты</h4>
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

    <h4 v-else>Спринты</h4>

    <SprintsTable />

    <CreateSprintDialog
        v-model="isSprintCreateOpen"
        @update-sprints="refreshSprints"
        />
        <!-- @reopen="reopen" -->
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRolesStore } from 'src/stores/roles-store';
import { useSprintStore } from 'src/modules/sprints/stores/sprint-store';
import { useRoute } from 'vue-router';

import SprintsTable from 'src/modules/sprints/sprints-table/components/SprintsTable.vue';
import CreateSprintDialog from 'src/modules/sprints/create-sprint-dialog/CreateSprintDialog.vue';
import { storeToRefs } from 'pinia';

const { hasPermission } = useRolesStore();
const sprintStore = useSprintStore();
const route = useRoute();
// const { sprintsList } = storeToRefs(sprintStore);

const isSprintCreateOpen = ref(false);

const refreshSprints = async () => {
  await sprintStore.getSprintsList(route.params.workspace as string);
}

onMounted(async () => {
  refreshSprints();
  // sprintStore.getSprintsList(route.params.workspace as string);
  // sprints.value = await getSprints(route.params.workspace as string);
});
</script>
