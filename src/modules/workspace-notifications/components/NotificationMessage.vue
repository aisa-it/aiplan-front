<template>
  <template v-for="(part, index) in parts" :key="index">
    <a
      v-if="part.type === 'link'"
      :href="part.href"
      class="text-primary no-underline"
      rel="noopener noreferrer"
      target="_blank"
    >
      {{ part.text }}
    </a>
    <span v-else>{{ part.text }}</span>
  </template>
</template>

<script setup lang="ts">
import type { NotificationMessagePart } from '../models';

defineProps<{
  parts: NotificationMessagePart[];
}>();
</script>
