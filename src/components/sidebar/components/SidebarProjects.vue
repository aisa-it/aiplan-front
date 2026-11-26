<template>
  <div v-if="compact" class="sidebar-list-title">
    <span>{{ t('sidebar.projects') }}</span>
    <ProjectCreateMenu
      v-if="canCreateProject"
      class="sidebar-header-add"
      @create="emit('create-project')"
    />
  </div>
  <div class="sidebar-list-scroll">
    <SidebarProjectRow
      v-for="project in compact ? compactProjects : projects"
      :key="project.id"
      :project="project"
      :compact="compact"
      :workspace-slug="workspaceSlug"
      :active="isActiveProject(project)"
      :can-open="canOpenProject(project)"
      :can-favorite="hasPermission(project, 'add-to-fav')"
      :can-show-menu="hasPermission(project, 'show-project-popup')"
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
    :to="{ name: 'workspace-projects', params: { workspace: workspaceSlug } }"
    @click="emit('navigate')"
    >{{ t('sidebar.allProjects') }}</RouterLink
  >
  <ProjectContextMenu
    v-if="compact && workspaceSlug"
    v-model="projectContextOpen"
    :target="projectContextTarget"
    :workspace-slug="workspaceSlug"
    :project="projectContextProject"
    :can-open-settings="!!projectContextProject && hasPermission(projectContextProject, 'project-settings')"
    @navigate="emit('navigate')"
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
import SettingsIcon from '@/components/icons/MenuSettingsIcon.vue';
import UnmutedIcon from '@/components/icons/UnmutedIcon.vue';
import LinkIcon from '@/components/icons/LinkIcon.vue';
import ProjectContextMenu from '@/modules/projects/components/ProjectContextMenu.vue';
import ProjectCreateMenu from '@/modules/projects/components/ProjectCreateMenu.vue';
import { getProjectRoute } from '@/modules/projects/model/project-routes';
import {
  canConfigureProjectNotifications,
  hasProjectPermission,
} from '@/modules/projects/model/project-permissions';
import type { ProjectNotificationTarget } from '@/modules/projects/model/project-notifications';
import SidebarProjectRow from './SidebarProjectRow.vue';
import { ProjectService } from '@/services/project.service';
import { useWorkspaceStore } from '@/stores/workspace-store';
import { useUserStore } from '@/stores/user-store';
import { checkPermissionByWs } from '@/utils/permissions';
import { toast } from '@/modules/toast';

const props = defineProps<{
  compact?: boolean;
  canCreateProject?: boolean;
  projectMemberships: Record<string, DtoProjectMemberWithLead>;
}>();
const emit = defineEmits<{
  navigate: [];
  'create-project': [];
  'open-notifications': [target: ProjectNotificationTarget];
}>();
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
const activeProjectParam = computed(() => {
  const { workspace, project } = route.params;
  if (
    route.name !== 'project' ||
    workspace !== workspaceSlug.value ||
    typeof project !== 'string'
  ) return;

  return project;
});
function isActiveProject({ id, identifier }: DtoProjectLight) {
  const active = activeProjectParam.value;
  return !!active && (active === id || active === identifier);
}
const favoritePending = ref<string | null>(null);
const projectContextOpen = ref(false);
const projectContextTarget = ref<[number, number]>([0, 0]);
const projectContextProject = ref<DtoProjectLight | null>(null);

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

function hasPermission(project: DtoProjectLight, action: string) {
  return hasProjectPermission(projectMembership(project), action);
}

function canAccessProject(project: DtoProjectLight) {
  return (
    hasPermission(project, 'show-project') ||
    checkPermissionByWs(workspaceRoleName.value, 'show-project')
  );
}

function canOpenProject(project: DtoProjectLight) {
  return props.compact
    ? canAccessProject(project)
    : hasPermission(project, 'show-project');
}

function projectMenuItems(project: DtoProjectLight) {
  return [
    ...(hasPermission(project, 'project-settings')
      ? [
          {
            label: t('sidebar.projectSettings'),
            icon: SettingsIcon,
            onClick: () => openProjectSettings(project),
          },
        ]
      : []),
    {
      label: t('projects.taskNotifications'),
      icon: UnmutedIcon,
      onClick: () => openNotifications(project, 'task'),
    },
    ...(canConfigureProjectNotifications(projectMembership(project))
      ? [{
          label: t('projects.projectNotifications'),
          icon: UnmutedIcon,
          onClick: () => openNotifications(project, 'project'),
        }]
      : []),
    {
      label: t('sidebar.copyLink'),
      icon: LinkIcon,
      onClick: () => void copyProjectLink(project),
    },
  ];
}

function openProjectSettings(project: DtoProjectLight) {
  if (!workspaceSlug.value) return;
  const target = getProjectRoute(workspaceSlug.value, project);
  if (!target) return;
  void router.push(`${router.resolve(target).path}/settings`);
  emit('navigate');
}

function openNotifications(project: DtoProjectLight, kind: ProjectNotificationTarget['kind']) {
  if (!workspaceSlug.value || !project.id) return;
  emit('open-notifications', {
    workspaceSlug: workspaceSlug.value,
    projectId: project.id,
    projectName: project.name ?? '',
    kind,
  });
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
