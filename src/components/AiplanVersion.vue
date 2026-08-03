<template>
  <span
    >{{
      route.fullPath.includes('signin') || route.fullPath.includes('signup')
        ? version
        : version?.split('v')[1] || version
    }}
  </span>
</template>

<script setup lang="ts">
import { useUtilsStore } from '@/stores/utils-store';
import { storeToRefs } from 'pinia';
import { useRoute } from 'vue-router';

const utilsStore = useUtilsStore();
const route = useRoute();
const { version } = storeToRefs(utilsStore);
</script>
