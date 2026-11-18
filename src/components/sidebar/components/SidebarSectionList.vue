<template>
  <div class="sidebar-list" :class="{ 'sidebar-list--compact': compact }">
    <SidebarProjects
      v-if="section === 'projects'"
      :compact="compact"
      :can-create-project="canCreateProject"
      :project-create-items="projectCreateItems"
      :project-memberships="projectMemberships"
      @navigate="emit('navigate')"
    />
    <SidebarSprints v-else :compact="compact" @navigate="emit('navigate')" />
  </div>
</template>

<script setup lang="ts">
import type { DtoProjectMemberWithLead } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import SidebarProjects from './SidebarProjects.vue';
import SidebarSprints from './SidebarSprints.vue';

defineProps<{
  section: 'projects' | 'sprints';
  compact?: boolean;
  canCreateProject: boolean;
  projectCreateItems: { label: string }[];
  projectMemberships: Record<string, DtoProjectMemberWithLead>;
}>();
const emit = defineEmits<{ navigate: [] }>();
</script>

<style src="../styles/SidebarSectionList.css"></style>
