<template>
  <span>
    <template v-for="(part, index) in message.parts" :key="index">
      <a
        v-if="part.type === 'external-link'"
        :href="part.href"
        target="_blank"
        rel="noopener noreferrer"
        class="font-normal text-primary no-underline"
      >
        {{ part.text }}
      </a>

      <RouterLink
        v-else-if="part.type === 'route-link'"
        :to="part.to"
        class="font-normal text-primary no-underline"
      >
        {{ part.text }}
      </RouterLink>

      <span v-else>{{ part.text }}</span>
    </template>
  </span>
</template>

<script setup lang="ts">
import type { ActivityMessage } from '../rendering/activity-renderer.types';

defineProps<{
  message: ActivityMessage;
}>();
</script>
