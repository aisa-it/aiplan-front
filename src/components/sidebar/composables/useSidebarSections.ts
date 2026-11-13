import { computed, ref, type Ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { checkPermissionByWs } from '@/utils/permissions';
import PlusIcon from '../icons/PlusIcon.vue';
import UnmutedIcon from '../icons/UnmutedIcon.vue';
import type { SidebarSectionId } from './useSidebarPreferences';
import type { useSidebarPreferences } from './useSidebarPreferences';

type SectionPreferences = Pick<
  ReturnType<typeof useSidebarPreferences>,
  'open' | 'helpOpen' | 'sections' | 'weights'
>;

export function useSidebarSections(
  preferences: SectionPreferences,
  workspaceRoleName: Ref<string>,
  isNarrow: Ref<boolean>,
  viewportWidth: Ref<number>,
  ignoreNextClick: Ref<boolean>,
) {
  const { t } = useI18n();
  const mobileSectionOpen = ref<Record<SidebarSectionId, boolean>>({
    projects: true,
    sprints: true,
  });
  const open = computed(() =>
    isNarrow.value ? mobileSectionOpen.value : preferences.open.value,
  );
  const mobileHelpOpen = ref(false);
  const helpOpen = computed({
    get: () =>
      isNarrow.value ? mobileHelpOpen.value : preferences.helpOpen.value,
    set: (value: boolean) => {
      if (isNarrow.value) mobileHelpOpen.value = value;
      else preferences.helpOpen.value = value;
    },
  });
  const visibleSections = computed(() =>
    preferences.sections.value.filter(
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

  function sectionGrow(id: SidebarSectionId) {
    if (!open.value[id]) return 0;
    const expanded = visibleSections.value.filter(
      (section) => open.value[section],
    );
    const totalWeight = expanded.reduce(
      (sum, section) => sum + preferences.weights.value[section],
      0,
    );
    return totalWeight > 0
      ? preferences.weights.value[id] / totalWeight
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

  return {
    open,
    helpOpen,
    visibleSections,
    canCreateProject,
    projectCreateItems,
    sprintHeaderItems,
    sectionGrow,
    toggleSection,
  };
}
