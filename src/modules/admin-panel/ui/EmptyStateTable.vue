<template>
  <div class="column flex-center" style="width: 100%; height: 75vh">
    <DefaultLoader v-if="loading" />
    <div v-else class="column flex-center">
      <slot />
      <h6>{{ title }}</h6>
    </div>
  </div>
</template>

<script setup lang="ts">
import DefaultLoader from 'components/loaders/DefaultLoader.vue';

defineProps<{ loading: boolean; title: string }>();
</script>
