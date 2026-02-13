<template>
  <q-chip
    v-if="show"
    class="q-px-xs q-py-md hint-overlay"
    dense
  >
    <LLMIcon />
    <span class="hint-overlay__text">Создано с помощью ИИ</span>
  </q-chip>
</template>

<script setup lang="ts">
import LLMIcon from './icons/LLMIcon.vue';

defineProps<{
  show: boolean;
}>();
</script>
