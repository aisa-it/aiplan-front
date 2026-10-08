<template>
  <span class="whitespace-nowrap">{{ date ? formatDateTime(date) : '-' }}</span>
</template>

<script setup lang="ts">
import { formatDateTime } from '@/utils/time';

defineProps<{ date?: string | null }>();
</script>
