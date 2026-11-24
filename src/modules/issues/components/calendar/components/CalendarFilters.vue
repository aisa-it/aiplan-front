<template>
  <section class="px-4 pb-4">
    <h2 class="mb-3 text-xl font-medium">{{ t('issues.filters.display') }}</h2>
    <div class="grid gap-3">
      <v-select
        :model-value="'calendar'"
        :items="viewOptions"
        :label="t('issues.filters.view')"
        variant="underlined"
        density="compact"
        hide-details
        @update:model-value="changeView"
      />
      <CalendarRemoteFilter
        v-for="field in memberFields"
        :key="field"
        :model-value="filters[field]"
        :load="loadMembers"
        :label="t(`issues.calendar.${field}`)"
        @update:model-value="setFilter(field, $event ?? [])"
      />
      <CalendarRemoteFilter
        :model-value="filters.labels"
        :load="loadLabels"
        :label="t('issues.columns.labels')"
        @update:model-value="setFilter('labels', $event ?? [])"
      />
      <CalendarRemoteFilter
        :model-value="filters.states"
        :load="loadStates"
        :label="t('issues.calendar.states')"
        :persistent-placeholder="filters.onlyActive"
        :placeholder="filters.onlyActive ? t('issues.filters.onlyActive') : undefined"
        @update:model-value="setStates"
      >
        <template #prepend>
          <v-checkbox
            :model-value="filters.onlyActive"
            :label="t('issues.filters.onlyActive')"
            class="px-3"
            density="compact"
            hide-details
            @update:model-value="setOnlyActive($event === true)"
          />
        </template>
      </CalendarRemoteFilter>
      <v-select
        :model-value="filters.priorities"
        :items="priorities"
        :label="t('issues.calendar.priorities')"
        variant="underlined"
        density="compact"
        hide-details
        multiple
        clearable
        @update:model-value="setFilter('priorities', $event ?? [])"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { AiplanFilterParams, DtoUserLight } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { projectsApi } from '@/services/clients';
import CalendarRemoteFilter from './CalendarRemoteFilter.vue';
import type { CalendarFilters } from '../utils/calendar-events';

const props = defineProps<{ workspaceId?: string; projectId: string }>();
const filters = defineModel<CalendarFilters>({ required: true });
const emit = defineEmits<{ view: [view: 'list' | 'kanban'] }>();
const { t } = useI18n();
const memberFields = ['authors', 'assignees', 'watchers'] as const;
const priorities = computed(() =>
  (['low', 'medium', 'high', 'urgent'] as const).map((value) => ({
    value,
    title: t(`issues.groups.priorities.${value}`),
  })),
);
const viewOptions = computed(() => [
  { value: 'list', title: t('issues.filters.list') },
  { value: 'kanban', title: t('issues.filters.board') },
  { value: 'calendar', title: t('issues.filters.calendar') },
]);

function changeView(view: string) {
  if (view === 'list' || view === 'kanban') emit('view', view);
}

function setFilter(key: Exclude<keyof CalendarFilters, 'onlyActive'>, value: string[]) {
  filters.value = { ...filters.value, [key]: value };
}

function setStates(states: string[] | null) {
  filters.value = { ...filters.value, states: states ?? [], onlyActive: false };
}

function setOnlyActive(onlyActive: boolean) {
  filters.value = { ...filters.value, onlyActive, states: [] };
}

const query = { limit: 1000 };
function filterParams(search: string): AiplanFilterParams {
  return {
    project_ids: [props.projectId],
    ...(props.workspaceId ? { workspace_ids: [props.workspaceId] } : {}),
    search_query: search || undefined,
  };
}

async function loadMembers(search: string, signal: AbortSignal) {
  const { data } = await projectsApi.getFilterMemberList(filterParams(search), query, { signal });
  return (data.result ?? []).flatMap((user: DtoUserLight) => {
    const name = [user.first_name, user.last_name].filter(Boolean).join(' ') || user.email;
    return user.id && name ? [{ id: user.id, name }] : [];
  });
}

function namedOptions(items: { id?: string; name?: string; color?: string }[] | undefined) {
  return (items ?? []).flatMap(({ id, name, color }) => id && name ? [{ id, name, color }] : []);
}

async function loadLabels(search: string, signal: AbortSignal) {
  const { data } = await projectsApi.getFilterLabelList(filterParams(search), query, { signal });
  return namedOptions(data.result);
}

async function loadStates(search: string, signal: AbortSignal) {
  const { data } = await projectsApi.getFilterStateList(filterParams(search), query, { signal });
  return namedOptions(data.result);
}
</script>
