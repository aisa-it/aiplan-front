<template>
  <div class="event-dots">
    <span
      v-for="type in types"
      :key="type"
      class="event-dot"
      :style="{ backgroundColor: EVENT_TYPES[type].color }"
    />
  </div>
</template>

<script setup lang="ts">
import { CalendarEventType } from '../../types/calendar';
import { CALENDAR_EVENT_TYPES as EVENT_TYPES } from '../../constants/event-types';

defineProps<{
  types: Set<CalendarEventType>;
}>();
</script>

<style scoped lang="scss">
.event-dots {
  position: absolute;
  bottom: 2px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 2px;
}

.event-dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
}
</style>
