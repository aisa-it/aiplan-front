<template>
  <v-navigation-drawer
    v-if="!isAiDocRoute"
    :model-value="!isNarrow || mobileOpen"
    :permanent="!isNarrow"
    :temporary="isNarrow"
    :rail="!isNarrow && mini"
    :rail-width="56"
    :width="isNarrow ? 300 : sidebarWidth"
    color="background"
    class="main-sidebar"
    :class="{
      'main-sidebar--resizing': isWidthResizing,
      'main-sidebar--resizing-height': isHeightResizing,
    }"
    @update:model-value="emit('update:mobileOpen', $event)"
    @mouseenter="showToggle = true"
    @mouseleave="showToggle = false"
  >
    <div
      class="sidebar-shell"
      :class="{ 'sidebar-shell--compact': compact }"
      data-tour="sidebar"
    >
      <div ref="sidebarMain" class="sidebar-main">
        <RouterLink
          v-if="workspaceSlug"
          class="sidebar-home"
          :class="{ 'sidebar-active': route.name === 'general-workspace' }"
          :to="{
            name: 'general-workspace',
            params: { workspace: workspaceSlug },
          }"
          :title="compact ? t('sidebar.home') : undefined"
          @click="closeMobile"
        >
          <HomeIcon
            :color="
              route.name === 'general-workspace'
                ? 'rgb(var(--v-theme-primary))'
                : 'currentColor'
            "
          />
          <span v-if="!compact">{{ t('sidebar.home') }}</span>
        </RouterLink>

        <template v-for="(section, index) in visibleSections" :key="section">
          <SidebarCompactSection
            v-if="compact"
            v-model:open="popupOpen[section]"
            :section="section"
            :active="isActive(section)"
            :project-memberships="projectMemberships"
            :can-create-project="canCreateProject"
            :project-create-items="projectCreateItems"
            @navigate="onNavigate"
          />

          <SidebarExpandedSection
            v-else
            :section="section"
            :has-previous="index > 0"
            :previous-open="index > 0 && open[visibleSections[index - 1]]"
            :open="open[section]"
            :active="isActive(section)"
            :grow="sectionGrow(section)"
            :project-memberships="projectMemberships"
            :can-create-project="canCreateProject"
            :project-create-items="projectCreateItems"
            :sprint-header-items="sprintHeaderItems"
            @resize="startHeightResize($event, section, visibleSections[index - 1])"
            @toggle="toggleSection($event, section)"
            @navigate="onNavigate"
          />
        </template>
      </div>

      <SidebarHelp v-model:open="helpOpen" :compact="compact" />
    </div>

    <button
      v-if="!isNarrow && showToggle"
      class="sidebar-toggle"
      :aria-label="mini ? t('sidebar.expandMenu') : t('sidebar.collapseMenu')"
      @click="mini = !mini"
    >
      <span class="material-symbols-rounded sidebar-toggle-icon">{{
        mini ? 'chevron_right' : 'chevron_left'
      }}</span>
    </button>
    <div
      v-if="!isNarrow && !mini"
      class="sidebar-width-handle"
      @pointerdown="startWidthResize"
    />
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useRoute } from 'vue-router';
import { useDisplay } from 'vuetify';
import { useI18n } from 'vue-i18n';
import HomeIcon from '@/components/icons/HomeIcon.vue';
import PlusIcon from './icons/PlusIcon.vue';
import UnmutedIcon from './icons/UnmutedIcon.vue';
import { useWorkspaceStore } from '@/stores/workspace-store';
import { useUserStore } from '@/stores/user-store';
import { useUtilsStore } from '@/stores/utils-store';
import { checkPermissionByWs } from '@/utils/permissions';
import SidebarCompactSection from './components/SidebarCompactSection.vue';
import SidebarExpandedSection from './components/SidebarExpandedSection.vue';
import SidebarHelp from './components/SidebarHelp.vue';
import {
  useSidebarPreferences,
  type SidebarSectionId,
} from './composables/useSidebarPreferences';
import { useSidebarProjectMemberships } from './composables/useSidebarProjectMemberships';
import { useSidebarResize } from './composables/useSidebarResize';
import { useSidebarSortable } from './composables/useSidebarSortable';

const props = defineProps<{ mobileOpen: boolean }>();
const emit = defineEmits<{ 'update:mobileOpen': [value: boolean] }>();
const { t } = useI18n();
const route = useRoute();
const { width: viewportWidth } = useDisplay();
const isNarrow = computed(() => viewportWidth.value < 1024);
const compact = computed(() => !isNarrow.value && mini.value);
const isAiDocRoute = computed(() => route.path.includes('/aidoc'));
const workspaceStore = useWorkspaceStore();
const { currentWorkspaceSlug, workspaceSummary } = storeToRefs(workspaceStore);
const { workspaceRoleName } = storeToRefs(useUserStore());
const workspaceSlug = computed(() => currentWorkspaceSlug.value);
const {
  mini,
  width: sidebarWidth,
  open: storedOpen,
  weights,
  helpOpen: savedHelpOpen,
  sections,
  setVisibleOrder,
} = useSidebarPreferences(workspaceSlug);
const {
  isWidthResizing,
  isHeightResizing,
  startWidthResize,
  startHeightResize,
} = useSidebarResize(sidebarWidth, viewportWidth, weights);
const projectMemberships = useSidebarProjectMemberships(
  currentWorkspaceSlug,
  workspaceSummary,
);
const mobileSectionOpen = ref<Record<SidebarSectionId, boolean>>({
  projects: true,
  sprints: true,
});
const open = computed(() =>
  isNarrow.value ? mobileSectionOpen.value : storedOpen.value,
);
const mobileHelpOpen = ref(false);
const helpOpen = computed({
  get: () => (isNarrow.value ? mobileHelpOpen.value : savedHelpOpen.value),
  set: (value) => {
    if (isNarrow.value) mobileHelpOpen.value = value;
    else savedHelpOpen.value = value;
  },
});
const visibleSections = computed(() =>
  sections.value.filter(
    (id) =>
      id !== 'sprints' ||
      checkPermissionByWs(workspaceRoleName.value, 'show-sprints-nav'),
  ),
);
const canCreateProject = computed(() =>
  checkPermissionByWs(workspaceRoleName.value, 'create-project'),
);
const canCreateSprint = computed(() =>
  checkPermissionByWs(workspaceRoleName.value, 'create-sprint'),
);
const projectCreateItems = computed(() => [
  { label: t('sidebar.createProject') },
  { label: t('sidebar.createForm') },
  { label: t('sidebar.importJira') },
]);
const sprintHeaderItems = computed(() => [
  ...(canCreateSprint.value
    ? [{ label: t('sidebar.createSprint'), icon: PlusIcon }]
    : []),
  { label: t('sidebar.notificationSettings'), icon: UnmutedIcon },
]);
const showToggle = ref(false);
const popupOpen = ref<Record<SidebarSectionId, boolean>>({
  projects: false,
  sprints: false,
});
const utilsStore = useUtilsStore();
if (!utilsStore.version) void utilsStore.getVersion();
const sidebarMain = ref<HTMLElement | null>(null);
const { ignoreNextClick } = useSidebarSortable(
  sidebarMain,
  compact,
  isAiDocRoute,
  setVisibleOrder,
);

watch(() => route.fullPath, onNavigate);
watch(
  currentWorkspaceSlug,
  (slug) => {
    if (slug)
      void workspaceStore
        .getWorkspaceSummary(slug)
        .catch((error) => console.error('Failed to load sidebar data', error));
  },
  { immediate: true },
);
watch(
  viewportWidth,
  (value) => {
    if (value >= 1024)
      sidebarWidth.value = Math.min(
        sidebarWidth.value,
        Math.max(300, value / 2),
      );
  },
  { immediate: true },
);
function closeMobile() {
  if (isNarrow.value && props.mobileOpen) emit('update:mobileOpen', false);
}
function onNavigate() {
  popupOpen.value.projects = false;
  popupOpen.value.sprints = false;
  closeMobile();
}
function isActive(id: SidebarSectionId) {
  return id === 'projects'
    ? route.path.includes('/projects/')
    : route.path.includes('/sprints/');
}
function sectionGrow(id: SidebarSectionId) {
  if (!open.value[id]) return 0;
  const expanded = visibleSections.value.filter(
    (section) => open.value[section],
  );
  const totalWeight = expanded.reduce(
    (sum, section) => sum + weights.value[section],
    0,
  );
  return totalWeight > 0
    ? weights.value[id] / totalWeight
    : 1 / expanded.length;
}
function toggleSection(event: Event, id: SidebarSectionId) {
  if (ignoreNextClick.value) {
    event.preventDefault();
    ignoreNextClick.value = false;
    return;
  }
  if (viewportWidth.value <= 650 && !open.value[id]) {
    for (const other of visibleSections.value) open.value[other] = false;
  }
  open.value[id] = !open.value[id];
}
</script>

<style scoped src="./styles/MainSidebar.css"></style>
<style src="./styles/MainSidebar.global.css"></style>
