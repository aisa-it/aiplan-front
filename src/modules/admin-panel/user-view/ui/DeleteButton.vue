<template>
  <q-btn flat dense>
    <RemoveIcon />
    <HintTooltip>{{ 'Удалить пользователя' }}</HintTooltip>
  </q-btn>
</template>

<script setup lang="ts">
import RemoveIcon from 'src/components/icons/RemoveIcon.vue';
</script>
