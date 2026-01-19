<template>
  <div
    class="calendar-period-nav row items-center"
    :class="{ 'justify-between': fullSize }"
  >
    <q-btn flat dense icon="chevron_left" @click="emit('prev')" />

    <div class="calendar-period-nav__label q-px-md">
      {{ label }}
    </div>

    <q-btn flat dense icon="chevron_right" @click="emit('next')" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useCalendarStore } from '../store/calendar-store';

type ViewMode = 'week' | 'month' | 'year';

const props = defineProps<{
  currentDate: Date;
  viewMode: ViewMode;
  fullSize?: boolean;
}>();

const emit = defineEmits<{
  (e: 'prev'): void;
  (e: 'next'): void;
}>();

const calendarStore = useCalendarStore();

const label = computed(() => {
  const date = props.currentDate;

  if (props.viewMode === 'week') {
    const { from, to } = calendarStore.visibleRange;

    return `${formatDate(from)} – ${formatDate(to)}`;
  }

  if (props.viewMode === 'month') {
    return date.toLocaleString('ru-RU', { month: 'long' });
  }

  return String(date.getFullYear());
});

function formatDate(date: Date) {
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  });
}
</script>

<style scoped lang="scss">
.calendar-period-nav__label {
  font-weight: 600;
  font-size: 16px;
  letter-spacing: 0.5px;
  text-transform: capitalize;
}

:deep(.q-btn--dense) {
  padding: 0;
  height: 40px;
  width: 40px;
}
</style>
