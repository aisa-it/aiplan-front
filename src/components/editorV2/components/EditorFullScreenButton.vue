<template>
  <q-btn dense flat @click="toggleFullScreen">
    <q-icon name="fullscreen" dense size="24px" />
    <HintTooltip>Развернуть</HintTooltip>
  </q-btn>
</template>

<script setup>
const emit = defineEmits(['toggle-fullscreen']);

const toggleFullScreen = (e) => {
  emit('toggle-fullscreen', e);
};
</script>
