<template>
  <div v-if="compact" class="sidebar-list-title">
    <span>{{ t('sidebar.projects') }}</span>
    <SidebarContextMenu
      v-if="canCreateProject"
      :items="projectCreateItems"
      plain
    >
      <template #activator="{ props: menuProps }">
        <v-btn
          v-bind="menuProps"
          class="sidebar-header-add"
          color="text"
          icon
          size="x-small"
          variant="text"
          :aria-label="t('sidebar.createProject')"
          ><PlusIcon
        /></v-btn>
      </template>
    </SidebarContextMenu>
  </div>
  <div class="sidebar-list-scroll">
    <SidebarProjectRow
      v-for="project in compact ? compactProjects : projects"
      :key="project.id"
      :project="project"
      :compact="compact"
      :workspace-slug="workspaceSlug"
      :active="route.params.project === project.identifier"
      :can-open="canOpenProject(project)"
      :can-favorite="hasProjectPermission(project, 'add-to-fav')"
      :can-show-menu="hasProjectPermission(project, 'show-project-popup')"
      :favorite-pending="favoritePending === project.id"
      :menu-items="projectMenuItems(project)"
      @navigate="emit('navigate')"
      @favorite="toggleFavorite(project)"
      @contextmenu="onProjectContextMenu($event, project)"
    />
  </div>
  <RouterLink
    v-if="compact && workspaceSlug"
    class="sidebar-list-footer"
    :to="`/${workspaceSlug}/projects`"
    @click="emit('navigate')"
    >{{ t('sidebar.allProjects') }}</RouterLink
  >
  <SidebarProjectContextMenu
    v-if="compact"
    v-model="projectContextOpen"
    :target="projectContextTarget"
    :items="projectContextItems"
  />
</template>

<script setup lang="ts">
import { computed, nextTick, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import type {
  DtoProjectLight,
  DtoProjectMemberWithLead,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';
import PlusIcon from '../icons/PlusIcon.vue';
import SettingsIcon from '../icons/SettingsIcon.vue';
import UnmutedIcon from '../icons/UnmutedIcon.vue';
import LinkIcon from '../icons/LinkIcon.vue';
import OpenNewTabIcon from '../icons/OpenNewTabIcon.vue';
import OpenNewWindowIcon from '../icons/OpenNewWindowIcon.vue';
import CopyNameIcon from '../icons/CopyNameIcon.vue';
import SidebarContextMenu from './SidebarContextMenu.vue';
import SidebarProjectContextMenu from './SidebarProjectContextMenu.vue';
import SidebarProjectRow from './SidebarProjectRow.vue';
import { ProjectService } from '@/services/project.service';
import { useWorkspaceStore } from '@/stores/workspace-store';
import { useUserStore } from '@/stores/user-store';
import {
  checkPermissionByProject,
  checkPermissionByWs,
  defineRole,
} from '@/utils/permissions';
import { toast } from '@/modules/toast';

const props = defineProps<{
  compact?: boolean;
  canCreateProject: boolean;
  projectCreateItems: { label: string }[];
  projectMemberships: Record<string, DtoProjectMemberWithLead>;
}>();
const emit = defineEmits<{ navigate: [] }>();
const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const workspaceStore = useWorkspaceStore();
const { currentWorkspaceSlug, workspaceSummary } = storeToRefs(workspaceStore);
const { workspaceRoleName } = storeToRefs(useUserStore());
const workspaceSlug = computed(() => currentWorkspaceSlug.value);
const projects = computed(() =>
  [...(workspaceSummary.value?.projects ?? [])].sort(
    (a, b) => Number(!!b.is_favorite) - Number(!!a.is_favorite),
  ),
);
const compactProjects = computed(() => workspaceSummary.value?.projects ?? []);
const favoritePending = ref<string | null>(null);
const projectContextOpen = ref(false);
const projectContextTarget = ref<[number, number]>([0, 0]);
const projectContextProject = ref<DtoProjectLight | null>(null);
const projectContextItems = computed(() => {
  const project = projectContextProject.value;
  if (!project || !workspaceSlug.value) return [];
  const href = router.resolve({
    name: 'project',
    params: {
      workspace: workspaceSlug.value,
      project: project.identifier || project.id,
    },
  }).href;
  return [
    ...(hasProjectPermission(project, 'project-settings')
      ? [
          {
            label: t('sidebar.projectSettings'),
            icon: SettingsIcon,
            onClick: () => openProjectSettings(project),
          },
        ]
      : []),
    {
      label: t('sidebar.openNewTab'),
      icon: OpenNewTabIcon,
      onClick: () => {
        window.open(href, '_blank', 'noopener');
      },
    },
    {
      label: t('sidebar.openNewWindow'),
      icon: OpenNewWindowIcon,
      onClick: () => {
        window.open(href, '_blank', 'popup,noopener');
      },
    },
    {
      label: t('sidebar.copyName'),
      icon: CopyNameIcon,
      onClick: () => {
        void navigator.clipboard.writeText(project.name ?? '');
      },
    },
  ];
});

async function onProjectContextMenu(
  event: MouseEvent,
  project: DtoProjectLight,
) {
  if (!props.compact || !workspaceSlug.value || !canAccessProject(project))
    return;
  event.preventDefault();
  event.stopPropagation();
  projectContextOpen.value = false;
  projectContextProject.value = project;
  projectContextTarget.value = [event.clientX, event.clientY];
  await nextTick();
  projectContextOpen.value = true;
}

function projectMembership(project: DtoProjectLight) {
  return project.id ? props.projectMemberships[project.id] : undefined;
}

function hasProjectPermission(project: DtoProjectLight, action: string) {
  const membership = projectMembership(project);
  const role = membership?.is_project_lead
    ? 'lead'
    : defineRole(membership?.role ?? 0);
  return checkPermissionByProject(role, action);
}

function canAccessProject(project: DtoProjectLight) {
  return (
    hasProjectPermission(project, 'show-project') ||
    checkPermissionByWs(workspaceRoleName.value, 'show-project')
  );
}

function canOpenProject(project: DtoProjectLight) {
  return props.compact
    ? canAccessProject(project)
    : hasProjectPermission(project, 'show-project');
}

function projectMenuItems(project: DtoProjectLight) {
  return [
    ...(hasProjectPermission(project, 'project-settings')
      ? [
          {
            label: t('sidebar.projectSettings'),
            icon: SettingsIcon,
            onClick: () => openProjectSettings(project),
          },
        ]
      : []),
    { label: t('sidebar.taskNotifications'), icon: UnmutedIcon },
    ...(projectMembership(project)?.role === 15
      ? [{ label: t('sidebar.projectNotifications'), icon: UnmutedIcon }]
      : []),
    {
      label: t('sidebar.copyLink'),
      icon: LinkIcon,
      onClick: () => void copyProjectLink(project),
    },
  ];
}

function openProjectSettings(project: DtoProjectLight) {
  const projectKey = project.identifier || project.id;
  if (!workspaceSlug.value || !projectKey) return;
  void router.push(`/${workspaceSlug.value}/projects/${projectKey}/settings`);
  emit('navigate');
}

async function copyProjectLink(project: DtoProjectLight) {
  if (!workspaceSlug.value || !project.identifier) return;
  await navigator.clipboard.writeText(
    `${location.origin}/${workspaceSlug.value}/projects/${project.identifier}`,
  );
}

async function toggleFavorite(project: DtoProjectLight) {
  const slug = workspaceSlug.value;
  if (!slug || !project.id || favoritePending.value) return;
  favoritePending.value = project.id;
  try {
    if (project.is_favorite) {
      await ProjectService.removeFromFavorites(slug, project.id);
    } else {
      await ProjectService.addToFavorites(slug, project.id);
    }
    await workspaceStore.getWorkspaceSummary(slug);
    toast.success(
      t(
        project.is_favorite
          ? 'sidebar.favoriteRemoved'
          : 'sidebar.favoriteAdded',
      ),
    );
  } catch (error) {
    toast.error(
      t(
        project.is_favorite
          ? 'sidebar.favoriteRemoveError'
          : 'sidebar.favoriteAddError',
      ),
    );
  } finally {
    favoritePending.value = null;
  }
}
</script>
