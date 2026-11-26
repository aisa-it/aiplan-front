<template>
  <SprintDetails
    :key="`${workspaceSlug}:${sprintId}`"
    :workspace-slug="workspaceSlug"
    :sprint-id="sprintId"
  />
</template>

<script setup lang="ts">
import SprintDetails from '@/modules/sprints/components/SprintDetails.vue';

defineProps<{ workspaceSlug: string; sprintId: string }>();
</script>
