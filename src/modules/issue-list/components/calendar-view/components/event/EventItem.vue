<template>
  <div
    ref="root"
    class="week-grid__event"
    :style="{ backgroundColor: event.color }"
    @mouseenter="open"
    @mouseleave="scheduleClose"
  >
    DIS-2 {{ event.title }}

    <q-menu
      ref="menu"
      anchor="bottom left"
      self="top left"
      :offset="[0, 15]"
      no-parent-event
      persistent
    >
      <EventCard :event="event" @mouseenter="cancelClose" @mouseleave="close" />
    </q-menu>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

import { CalendarEvent } from '../../types/calendar';
import EventCard from './EventCard.vue';

defineProps<{ event: CalendarEvent }>();

const root = ref<HTMLElement | null>(null);

defineExpose({
  el: root,
});

const menu = ref<any>();
let closeTimer: number | null = null;

function open() {
  cancelClose();
  menu.value?.show(root.value);
  // emitHover(true);
}

function scheduleClose() {
  closeTimer = window.setTimeout(() => {
    menu.value?.hide();
    // emitHover(false);
  }, 120);
}

function cancelClose() {
  if (closeTimer) {
    clearTimeout(closeTimer);
    closeTimer = null;
  }
}

function close() {
  cancelClose();
  menu.value?.hide();
  // emitHover(false);
}
</script>

<style lang="scss" scoped>
.week-grid__event {
  padding: 5px 4px;
  border-radius: 16px;
  color: white;
  line-height: 22px;
  word-wrap: break-word;
  min-height: 32px;
}

.week-grid__event:hover {
  cursor: pointer;
}
</style>
