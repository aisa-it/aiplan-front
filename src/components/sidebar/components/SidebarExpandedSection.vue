<template>
  <section
    :data-sidebar-section="section"
    class="sidebar-section"
    :class="{ 'sidebar-section--open': open }"
    :style="{ flexGrow: grow }"
  >
    <div
      v-if="hasPrevious && open && previousOpen"
      class="sidebar-height-handle"
      @pointerdown.stop="emit('resize', $event)"
    />
    <div
      class="sidebar-section-header"
      :class="{ 'sidebar-active': active }"
      role="button"
      tabindex="0"
      :aria-expanded="open"
      @click="emit('toggle', $event)"
      @keydown.enter.prevent="emit('toggle', $event)"
      @keydown.space.prevent="emit('toggle', $event)"
    >
      <component
        :is="sectionIcon"
        :color="active ? 'rgb(var(--v-theme-primary))' : 'currentColor'"
      />
      <span class="sidebar-section-title">{{ t(`sidebar.${section}`) }}</span>
      <ProjectCreateMenu
        v-if="section === 'projects' && canCreateProject"
        class="sidebar-header-add"
        @create="emit('create-project')"
      />
      <SidebarContextMenu
        v-if="section === 'sprints'"
        :items="sprintHeaderItems"
      >
        <template #activator="{ props: menuProps }">
          <v-btn
            v-bind="menuProps"
            color="text"
            icon
            size="x-small"
            variant="text"
            :aria-label="t('sidebar.notificationSettings')"
            @pointerdown.stop
            @click.stop
            ><span class="material-symbols-rounded sidebar-action-icon"
              >more_horiz</span
            ></v-btn
          >
        </template>
      </SidebarContextMenu>
      <span
        class="material-symbols-rounded sidebar-chevron"
        :class="{ 'sidebar-chevron--open': open }"
        >expand_more</span
      >
    </div>
    <div
      class="sidebar-section-content"
      :class="{ 'sidebar-section-content--closed': !open }"
      :inert="!open"
      :aria-hidden="!open"
    >
      <SidebarSectionList
        :section="section"
        :project-memberships="projectMemberships"
        @navigate="emit('navigate')"
        @open-notifications="emit('open-notifications', $event)"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, type Component } from 'vue';
import { useI18n } from 'vue-i18n';
import type { DtoProjectMemberWithLead } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import MenuProjectsIcon from '../icons/MenuProjectsIcon.vue';
import SprintIcon from '@/components/icons/SprintIcon.vue';
import ProjectCreateMenu from '@/modules/projects/components/ProjectCreateMenu.vue';
import type { ProjectNotificationTarget } from '@/modules/projects/model/project-notifications';
import type { SidebarSectionId } from '../composables/useSidebarPreferences';
import SidebarContextMenu from '@/components/menus/ActionMenu.vue';
import SidebarSectionList from './SidebarSectionList.vue';

const props = defineProps<{
  section: SidebarSectionId;
  hasPrevious: boolean;
  previousOpen: boolean;
  open: boolean;
  active: boolean;
  grow: number;
  canCreateProject: boolean;
  sprintHeaderItems: { label: string; icon?: Component }[];
  projectMemberships: Record<string, DtoProjectMemberWithLead>;
}>();
const emit = defineEmits<{
  resize: [event: PointerEvent];
  toggle: [event: Event];
  navigate: [];
  'create-project': [];
  'open-notifications': [target: ProjectNotificationTarget];
}>();
const { t } = useI18n();
const sectionIcon = computed(() =>
  props.section === 'projects' ? MenuProjectsIcon : SprintIcon,
);
</script>

<style scoped src="../styles/SidebarExpandedSection.css"></style>
