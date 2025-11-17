<template>
  <q-page>
    <q-card class="single-list relative" flat dense>
      <q-card-section
        class="row issue-list__header"
        :style="'padding: 12px 16px'"
      >
        <div
          class="q-table__title abbriviated-text"
          :style="' max-width: calc(100% - 60px)'"
        >
          <span> Задачи спринта {{ sprint?.name }} </span>
        </div>
        <q-space />

        <SprintFiltersList
          v-if="is.object(sprintProps)"
          :columns="allSprintColumns"
          @update="load()"
        />
      </q-card-section>
      <q-separator />
      <!-- <SpintIssues /> -->
    </q-card>
  </q-page>
</template>

<script lang="ts" setup>
import { is } from 'quasar';
import { useRouter } from 'vue-router';
import { onMounted, ref } from 'vue';

import { getSprint } from 'src/modules/sprints/services/api';
import { DtoSprint } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { allSprintColumns } from 'src/modules/issue-list/constants/sprintTableColumns';

import SpintIssues from 'src/modules/sprints/issues/SpintIssues.vue';
import SprintFiltersList from 'src/modules/issue-list/components/SprintFiltersList.vue';

import { useSprintStore } from 'src/modules/sprints/stores/sprint-store';
import { storeToRefs } from 'pinia';

const router = useRouter();
const sprint = ref({} as DtoSprint);

const sprintStore = useSprintStore();

const { isGroupingEnabled, isKanbanEnabled, issuesLoader, sprintProps } =
  storeToRefs(sprintStore);

console.log(sprintProps);

const load = async () => {
  issuesLoader.value = true;

  if (isGroupingEnabled.value === false) {
    //await onRequest();
  } else if (isGroupingEnabled.value === true) {
    //await getGroupedIssues();
  }

  issuesLoader.value = false;
};

onMounted(async () => {
  issuesLoader.value = true;

  await sprintStore.getMyViewProps();
  sprint.value = await getSprint(
    router.currentRoute.value.params.workspace as string,
    router.currentRoute.value.params.sprint as string,
  );
  issuesLoader.value = false;
});
</script>
