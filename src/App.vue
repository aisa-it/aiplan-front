<template>
  <router-view />
  <ToastContainer />
</template>

<script setup lang="ts">
import { useAppThemeSync } from '@/composables/useAppThemeSync';
import { ToastContainer } from '@/modules/toast';

useAppThemeSync();
</script>
