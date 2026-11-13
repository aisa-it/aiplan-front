<template>
  <v-avatar v-if="project.logo" :size="compact ? 24 : 22" rounded="sm"
    ><v-img :src="getUrlFile(project.logo)"
  /></v-avatar>
  <span v-else-if="project.emoji" class="sidebar-project-mark">{{
    projectEmoji(project.emoji)
  }}</span>
  <v-avatar
    v-else
    :size="compact ? 24 : 22"
    rounded="sm"
    color="primary"
    variant="tonal"
    >{{ project.name?.[0]?.toUpperCase() }}</v-avatar
  >
  <span class="sidebar-project-label">
    <span class="sidebar-project-name" :title="project.name">{{
      project.name
    }}</span>
    <span
      v-if="compact && project.identifier"
      class="sidebar-project-identifier"
      >({{ project.identifier }})</span
    >
  </span>
</template>

<script setup lang="ts">
import type { DtoProjectLight } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { getUrlFile } from '@/utils/helpers';

defineProps<{ project: DtoProjectLight; compact?: boolean }>();

function projectEmoji(value: string) {
  const code = Number.parseInt(value, 10);
  return Number.isFinite(code) && code > 0 && code <= 0x10ffff
    ? String.fromCodePoint(code)
    : value;
}
</script>
