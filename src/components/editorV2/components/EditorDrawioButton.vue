<template>
  <q-btn dense flat>
    <HintTooltip>Вставить диаграмму</HintTooltip>
    <DrawioIcon :width="24" :height="24" />
  </q-btn>
</template>

<script setup lang="ts">
import DrawioIcon from 'src/components/icons/DrawioIcon.vue';
</script>
