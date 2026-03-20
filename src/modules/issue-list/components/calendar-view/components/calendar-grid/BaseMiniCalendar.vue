<template>
  <div class="mini-calendar">
    <PeriodNav
      class="mini-calendar__header"
      :current-date="currentDate"
      view-mode="month"
      full-size
      :off-navigation="offNavigation"
      @prev="emits('prevMonth')"
      @next="emits('nextMonth')"
    />

    <div class="mini-calendar__weekdays">
      <div v-for="d in weekdays" :key="d" class="weekday">
        {{ d }}
      </div>
    </div>

    <slot />
  </div>
</template>

<script setup lang="ts">
import PeriodNav from '../navigation/PeriodNav.vue';

defineProps<{
  currentDate: Date;
  offNavigation?: boolean;
}>();

const emits = defineEmits<{
  prevMonth: [];
  nextMonth: [];
}>();

const weekdays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
</script>

<style lang="scss" scoped>
.mini-calendar {
  color: var(--q-text-color);
  padding: 4px 16px;
}

.mini-calendar__header {
  margin-bottom: 8px;
}

.mini-calendar__weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  row-gap: 4px;
  column-gap: 0;
}

.weekday {
  height: 40px;
  width: 40px;
  text-align: center;
  line-height: 40px;
  font-size: 16px;
  letter-spacing: 0.5px;
  justify-self: center;
}
</style>
