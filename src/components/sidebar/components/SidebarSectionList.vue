<template>
  <div class="sidebar-list" :class="{ 'sidebar-list--compact': compact }">
    <SidebarProjects
      v-if="section === 'projects'"
      :compact="compact"
      :can-create-project="canCreateProject"
      :project-memberships="projectMemberships"
      @navigate="emit('navigate')"
      @create-project="emit('create-project')"
      @open-notifications="emit('open-notifications', $event)"
    />
    <SidebarSprints v-else :compact="compact" @navigate="emit('navigate')" />
  </div>
</template>

<script setup lang="ts">
import type { DtoProjectMemberWithLead } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import type { ProjectNotificationTarget } from '@/modules/projects/model/project-notifications';
import SidebarProjects from './SidebarProjects.vue';
import SidebarSprints from './SidebarSprints.vue';

defineProps<{
  section: 'projects' | 'sprints';
  compact?: boolean;
  canCreateProject?: boolean;
  projectMemberships: Record<string, DtoProjectMemberWithLead>;
}>();
const emit = defineEmits<{
  navigate: [];
  'create-project': [];
  'open-notifications': [target: ProjectNotificationTarget];
}>();
</script>

<style src="../styles/SidebarSectionList.css"></style>
