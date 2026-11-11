<template>
  <!-- TODO: подключить SelectSprints и проверку прав после переноса редактора. -->
  <div class="flex min-h-8 min-w-0 items-center">
    <span class="ml-1 truncate" :title="sprintText">{{ sprintText }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { DtoSprintLight } from '@aisa-it/aiplan-api-ts/src/data-contracts';

const props = defineProps<{ sprints?: DtoSprintLight[] }>();

const sprintText = computed(() =>
  props.sprints?.length
    ? props.sprints.map((sprint) => sprint.name).join(', ')
    : 'Не Выбран',
);
</script>
