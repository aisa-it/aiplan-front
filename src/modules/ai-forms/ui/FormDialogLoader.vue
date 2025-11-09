<template>
  <q-inner-loading
    style="max-width: none; max-height: 100%; height: 100vh"
    color="primary"
    :showing="isLoading"
  >
    <DefaultLoader />
  </q-inner-loading>
</template>

<script setup lang="ts">
import DefaultLoader from 'src/components/loaders/DefaultLoader.vue';
defineProps<{ isLoading: boolean }>();
</script>
