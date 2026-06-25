<template>
  <q-list dense>
    <q-item
      v-for="sprint in sprints"
      :key="sprint.id"
      clickable
      v-ripple
      class="nav-popup__item"
      :to="`/${currentWorkspaceSlug}/sprints/${sprint.id}`"
    >
      <q-item-section avatar>
        <StatusCircularProgressBar
          style="width: 24px"
          :stats="sprint.stats ?? {}"
        />
      </q-item-section>
      <q-item-section>
        <q-item-label class="ellipsis">
          {{ sprint.name }}
        </q-item-label>
        <q-item-label caption class="nav-popup__item-dates">
          {{ formatSprintDates(sprint.start_date, sprint.end_date) }}
        </q-item-label>
      </q-item-section>
    </q-item>
    <q-separator />

    <q-item
      clickable
      v-ripple
      class="nav-popup__footer-link"
      :to="`/${currentWorkspaceSlug}/sprints`"
      v-close-popup
    >
      Просмотр всех спринтов
    </q-item>
  </q-list>
</template>

<script setup lang="ts">
// core
import { computed } from 'vue';
import { storeToRefs } from 'pinia';

// stores
import { useWorkspaceStore } from 'src/stores/workspace-store';
import { renderShortDate } from 'src/utils/time';

// components
import StatusCircularProgressBar from 'src/components/progress-bars/StatusCircularProgressBar.vue';

const workspaceStore = useWorkspaceStore();
const { currentWorkspaceSlug } = storeToRefs(workspaceStore);

const sprints = computed(() => workspaceStore.workspaceSummary?.sprints ?? []);

const formatSprintDates = (start?: string, end?: string): string => {
  if (!start || !end) return '';
  return `${renderShortDate(start)?.toLowerCase()} — ${renderShortDate(end)?.toLowerCase()}`;
};
</script>
