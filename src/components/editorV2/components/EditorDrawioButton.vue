<template>
  <q-btn dense flat @click="handleClick">
    <HintTooltip>Вставить диаграмму</HintTooltip>
    <DrawioIcon width="24px" height="24px" />
  </q-btn>
</template>

<script setup>
import DrawioIcon from 'src/components/icons/DrawioIcon.vue';

const emit = defineEmits(['onClick']);

const handleClick = (e) => {
  emit('onClick', e);
};
</script>
