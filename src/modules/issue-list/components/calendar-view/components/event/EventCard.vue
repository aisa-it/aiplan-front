<template>
  <div class="event-card" :style="`border-top: 8px solid ${event.color}`">
    <div class="event-card__header">
      <p>
        {{ event.issueData?.indentifier }}-{{ event.issueData?.sequence_id }}
      </p>
      <p>{{ event.issueData?.title }}</p>
      <q-icon name="edit" />
    </div>

    <div class="event-card__row">
      <span>Статус</span>
      <!-- <StatusSelect :value="event.status" /> -->
    </div>

    <div class="event-card__row">
      <span>Дата создания</span>
      {{ event.issueData?.created_at }}
    </div>

    <div class="event-card__row">
      <span>Срок выполнения</span>
      {{ event.issueData?.target_date }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { CalendarEvent } from '../../types/calendar';

const props = defineProps<{
  event: CalendarEvent;
}>();
</script>

<style lang="scss" scoped>
.event-card {
  border-radius: 16px;
  width: 422px;
  min-height: 215px;
  padding: 24px 16px 19px 16px;
}

.event-card__header {
  display: flex;
  gap: 18px;
}
</style>
