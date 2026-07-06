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
      Спринты
    </div>
    <div class="scroll">
      <q-list dense>
        <q-item
          v-for="sprint in sprints"
          :key="sprint.id"
          clickable
          v-ripple
          :active="route.params.sprint === String(sprint.id)"
          active-class="nav-popup__item--active text-weight-medium"
          :to="`/${currentWorkspaceSlug}/sprints/${sprint.id}`"
        >
          <q-item-section side class="q-pr-sm">
            <StatusCircularProgressBar
              style="width: 24px"
              :stats="sprint.stats ?? {}"
            />
          </q-item-section>
          <q-item-section>
            <q-item-label class="ellipsis">
              {{ sprint.name }}
            </q-item-label>
            <q-item-label caption class="text-grey-7 text-caption">
              {{ formatSprintDates(sprint.start_date, sprint.end_date) }}
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </div>
    <q-separator class="shrink" />

    <q-item
      dense
      clickable
      v-ripple
      class="shrink q-py-sm text-body2"
      :to="`/${currentWorkspaceSlug}/sprints`"
      v-close-popup
    >
      <q-item-section>
        <div class="text-primary">Просмотр всех спринтов</div></q-item-section
      >
    </q-item>
  </q-menu>
</template>

<script setup lang="ts">
// core
import { computed, watch, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useRoute } from 'vue-router';

import { useSprintStore } from 'src/modules/sprints/stores/sprint-store';

// stores
import { useWorkspaceStore } from 'src/stores/workspace-store';
import { renderShortDate } from 'src/utils/time';

// components
import StatusCircularProgressBar from 'src/components/progress-bars/StatusCircularProgressBar.vue';

const workspaceStore = useWorkspaceStore();
const { currentWorkspaceSlug } = storeToRefs(workspaceStore);
const route = useRoute();

const { sprintsList } = storeToRefs(useSprintStore());

const sprints = computed(
  () => sprintsList.value?.map((folder) => folder?.sprints || []).flat() ?? [],
);

const formatSprintDates = (start?: string, end?: string): string => {
  if (!start || !end) return '';
  return `${renderShortDate(start)?.toLowerCase()} — ${renderShortDate(end)?.toLowerCase()}`;
};

watch(
  () => workspaceStore.workspaceSummary?.sprints,
  (newSprintList) => {
    sprintsList.value = newSprintList ?? [];
  },
  { immediate: true },
);
</script>
