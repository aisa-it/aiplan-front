<template>
  <v-menu
    :model-value="open"
    location="end"
    :offset="8"
    :close-on-content-click="false"
    @update:model-value="emit('update:open', $event)"
  >
    <template #activator="{ props: menuProps }">
      <button
        v-bind="menuProps"
        class="sidebar-rail-item"
        :class="{ 'sidebar-active': active }"
        :title="t(`sidebar.${section}`)"
        :aria-label="t(`sidebar.${section}`)"
      >
        <component
          :is="sectionIcon"
          :color="active ? 'rgb(var(--v-theme-primary))' : 'currentColor'"
        />
      </button>
    </template>
    <div class="sidebar-popup">
      <SidebarSectionList
        :section="section"
        :project-memberships="projectMemberships"
        :can-create-project="canCreateProject"
        :project-create-items="projectCreateItems"
        compact
        @navigate="emit('navigate')"
      />
    </div>
  </v-menu>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { DtoProjectMemberWithLead } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import MenuProjectsIcon from '@/components/icons/MenuProjectsIcon.vue';
import SprintIcon from '@/components/icons/SprintIcon.vue';
import type { SidebarSectionId } from '../composables/useSidebarPreferences';
import SidebarSectionList from './SidebarSectionList.vue';

const props = defineProps<{
  section: SidebarSectionId;
  open: boolean;
  active: boolean;
  canCreateProject: boolean;
  projectCreateItems: { label: string }[];
  projectMemberships: Record<string, DtoProjectMemberWithLead>;
}>();
const emit = defineEmits<{
  'update:open': [value: boolean];
  navigate: [];
}>();
const { t } = useI18n();
const sectionIcon = computed(() =>
  props.section === 'projects' ? MenuProjectsIcon : SprintIcon,
);
</script>

<style scoped src="../styles/SidebarCompactSection.css"></style>
