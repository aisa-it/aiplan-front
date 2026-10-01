<template>
  <router-view />
</template>

<script setup lang="ts">
import { useAppThemeSync } from '@/composables/useAppThemeSync';

useAppThemeSync();
</script>
