<template>
  <span>{{ displayedVersion }}</span>
</template>

<script setup lang="ts">
import { useUtilsStore } from '@/stores/utils-store';
import { storeToRefs } from 'pinia';
import { useRoute } from 'vue-router';
import { computed } from 'vue';

const utilsStore = useUtilsStore();
const route = useRoute();
const { version } = storeToRefs(utilsStore);
const displayedVersion = computed(() => {
  if (route.fullPath.includes('signin') || route.fullPath.includes('signup')) return version.value;
  return version.value.startsWith('v') ? version.value.slice(1) : version.value;
});
</script>
