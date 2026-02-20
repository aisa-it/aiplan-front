<template>
  <q-btn-dropdown
    flat
    no-caps
    dense
    class="calendar-view-select"
    dropdown-icon="expand_more"
  >
    <template #label>
      <span class="calendar-view-select__label">
        {{ currentLabel }}
      </span>
    </template>

    <q-list dense class="calendar-view-select__list">
      <q-item
        v-for="mode in modes"
        :key="mode.value"
        clickable
        v-close-popup
        @click="setMode(mode.value)"
      >
        <q-item-section>
          {{ mode.label }}
        </q-item-section>

        <q-item-section side v-if="mode.value === viewMode">
          <q-icon name="check" size="16px" />
        </q-item-section>
      </q-item>
    </q-list>
  </q-btn-dropdown>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useCalendarStore } from '../../store/calendar-store';

const calendarStore = useCalendarStore();
const { viewMode } = storeToRefs(calendarStore);

const modes = [
  { value: 'week', label: 'Неделя' },
  { value: 'month', label: 'Месяц' },
  { value: 'year', label: 'Год' },
] as const;

const currentLabel = computed(
  () => modes.find((m) => m.value === viewMode.value)?.label,
);

function setMode(mode: typeof viewMode.value) {
  calendarStore.setViewMode(mode);
}
</script>

<style scoped lang="scss">
.calendar-view-select {
  border: 1px solid var(--border-color);
  border-radius: 8px;
  height: 40px;
  min-width: 120px;
}

.calendar-view-select__label {
  font-size: 14px;
  font-weight: 400;
  letter-spacing: 0.25;
}

.calendar-view-select__list {
  min-width: 120px;
}

:deep(.q-btn__content) {
  margin: 0 12px;
  justify-content: space-between;
}
</style>
