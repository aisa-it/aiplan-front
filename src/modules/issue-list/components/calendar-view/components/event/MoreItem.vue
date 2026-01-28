<template>
  <div class="week-grid__more" ref="root">
    Ещё {{ hiddenCount }}

    <q-menu ref="popap" anchor="bottom left" self="top left">
      <div class="overflow-popup">
        <div class="overflow-popup__header">
          <DayHeader :day="day" border-none />
          <q-btn
            class="close-button"
            icon="close"
            flat
            dense
            round
            color=""
            @click="popap.hide()"
          />
        </div>

        <div class="overflow-popup__list">
          <EventItem v-for="event in events" :key="event.id" :event="event" />
        </div>
      </div>
    </q-menu>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { CalendarEvent } from '../../types/calendar';
import DayHeader from '../day/DayHeader.vue';
import EventItem from './EventItem.vue';

defineProps<{
  hiddenCount: number;
  day: Date;
  events: CalendarEvent[];
}>();

const root = ref<HTMLElement>();
const popap = ref();

defineExpose({
  el: root,
});
</script>

<style lang="scss" scoped>
.week-grid__more {
  color: var(--primary);
  cursor: pointer;
}

.overflow-popup {
  padding: 16px 18px;
  width: 254px;
  max-height: 50vh;
  overflow-y: hidden;
  border-radius: 16px;
}

.close-button {
  position: absolute;
  top: 10px;
  right: 10px;
}

.overflow-popup__list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.overflow-popup__header {
  color: var(--text-brand-secondary);
  font-size: 16px;
  margin-bottom: 12px;

  :deep(.day-header__weekday) {
    text-transform: uppercase;
    padding: 0;
    margin-bottom: 8px;
  }

  :deep(.day-header__number) {
    font-size: 16px;
    font-weight: 500;
    padding: 0;
  }
}
</style>
