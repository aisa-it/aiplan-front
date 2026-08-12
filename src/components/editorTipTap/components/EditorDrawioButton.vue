<template>
  <v-btn icon variant="text" size="small" density="compact">
    <HintTooltip>Вставить диаграмму</HintTooltip>
    <DrawioIcon />
  </v-btn>
</template>

<script setup lang="ts">
import DrawioIcon from '@/components/icons/DrawioIcon.vue';
import HintTooltip from './HintTooltip.vue';
</script>
