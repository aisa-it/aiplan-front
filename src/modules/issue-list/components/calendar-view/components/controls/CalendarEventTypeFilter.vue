<template>
  <div class="calendar-event-filter">
    <div class="calendar-event-filter__title">Тип событий</div>

    <div class="calendar-event-filter__list">
      <label
        v-for="item in items"
        :key="item.type"
        class="calendar-event-filter__item row items-center"
      >
        <q-checkbox
          dense
          :model-value="isEnabled(item.type)"
          @update:model-value="toggle(item.type)"
          :style="{ '--event-color': item.color }"
          class="sprint-issue-checkbox"
        />

        <span class="calendar-event-filter__label">
          {{ item.label }}
        </span>
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCalendarFiltersStore } from '../../store/filters-store';
import { CALENDAR_EVENT_TYPES } from '../../constants/event-types';

const filtersStore = useCalendarFiltersStore();

const items = Object.values(CALENDAR_EVENT_TYPES);

const isEnabled = filtersStore.isEnabled;
const toggle = filtersStore.toggle;
</script>

<style scoped lang="scss">
.calendar-event-filter {
  padding: 0 16px;
}

.calendar-event-filter__title {
  font-size: 20px;
  font-weight: 500;
  letter-spacing: 0.15px;
  margin-bottom: 12px;
}

.calendar-event-filter__list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.calendar-event-filter__item {
  cursor: pointer;
}

.calendar-event-filter__label {
  margin-left: 8px;
  font-size: 14px;
  letter-spacing: 0.25px;
}

:deep(.q-checkbox > .q-checkbox__inner > .q-checkbox__bg) {
  border-color: var(--event-color) !important;
}

:deep(.q-checkbox__inner--truthy, .q-checkbox__inner--indet) {
  color: var(--event-color);
}
</style>
