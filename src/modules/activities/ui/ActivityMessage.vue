<template>
  <span>
    <template v-for="(part, index) in message.parts" :key="index">
      <a
        v-if="part.type === 'external-link'"
        :href="part.href"
        target="_blank"
        rel="noopener noreferrer"
        class="text-primary no-underline"
        :class="part.emphasized ? 'font-semibold' : 'font-normal'"
      >
        {{ part.text }}
      </a>

      <RouterLink
        v-else-if="part.type === 'route-link'"
        :to="part.to"
        class="text-primary no-underline"
        :class="part.emphasized ? 'font-semibold' : 'font-normal'"
      >
        {{ part.text }}
      </RouterLink>

      <span v-else>{{ part.text }}</span>
    </template>
  </span>
</template>

<script setup lang="ts">
import type { ActivityMessage } from '../renders/activity-renderer.types';

defineProps<{
  message: ActivityMessage;
}>();
</script>
