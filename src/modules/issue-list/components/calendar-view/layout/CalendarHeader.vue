<template>
  <div class="row justify-end items-center">
    <CalendarPeriodNav class="q-mx-auto" />
    <CalendarViewModeSelect class="q-mr-md" />
  </div>
</template>

<script setup lang="ts">
import CalendarPeriodNav from '../components/CalendarPeriodNav.vue';
import CalendarViewModeSelect from '../components/CalendarViewModeSelect.vue';
</script>
