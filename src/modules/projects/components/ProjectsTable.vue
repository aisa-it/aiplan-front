<template>
  <v-text-field
    v-model="search"
    :label="t('common.actions.search')"
    clearable
    density="compact"
    hide-details
    class="mb-4"
  />

  <v-data-table
    v-model:page="page"
    v-model:items-per-page="rowsPerPage"
    :headers="headers"
    :items="projects"
    no-data-text="projects.empty"
    gridlines="horizontal"
    :loading="loading"
    :row-props="getRowProps"
    class="projects-table rounded-lg border border-border"
    hover
    @click:row="onRowClick"
    @contextmenu:row="openContextMenu"
  >
    <template #loading>{{ t('common.states.loading') }}</template>
    <template #item.emoji="{ item }">
      {{ formatProjectEmoji(item.emoji) }}
    </template>
    <template #item.copy_link="{ item }">
      <v-btn
        icon
        size="small"
        variant="text"
        color="text"
        :disabled="!getProjectRoute(workspaceSlug, item)"
        :aria-label="t('projects.copyLink')"
        :title="t('projects.copyLink')"
        @click.stop="copyLink(item)"
      >
        <LinkIcon />
      </v-btn>
    </template>
    <template #item.task_notifications="{ item }">
      <v-btn
        icon
        size="small"
        variant="text"
        color="text"
        :disabled="!canAccessProject(item)"
        :aria-label="t('projects.taskNotifications')"
        :title="t('projects.taskNotifications')"
        @click.stop="openNotifications(item, 'task')"
      >
        <UnmutedIcon />
      </v-btn>
    </template>
    <template #item.project_notifications="{ item }">
      <v-btn
        v-if="canConfigureProjectNotifications(getMembership(item))"
        icon
        size="small"
        variant="text"
        color="text"
        :aria-label="t('projects.projectNotifications')"
        :title="t('projects.projectNotifications')"
        @click.stop="openNotifications(item, 'project')"
      >
        <UnmutedIcon />
      </v-btn>
    </template>
    <template #bottom>
      <PaginationDefault
        v-model:selected-page="page"
        v-model:rows-per-page="rowsPerPage"
        :rows-per-page-options="[10, 25, 50]"
        :rows-number="projects.length"
        show-row-range
        class="projects-table-pagination px-4"
      />
    </template>
  </v-data-table>

  <ProjectContextMenu
    v-model="contextOpen"
    :project="contextProject"
    :target="contextPosition"
    :workspace-slug="workspaceSlug"
    :can-open-settings="
      !!contextProject &&
      hasProjectPermission(getMembership(contextProject), 'project-settings')
    "
  />
  <ProjectNotificationsDialog v-model="notificationTarget" />
</template>

<script setup lang="ts">
import { computed, nextTick, ref, toRef, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import type { DtoProjectLight } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import type { DataTableHeader } from 'vuetify';
import LinkIcon from '@/components/icons/LinkIcon.vue';
import UnmutedIcon from '@/components/icons/UnmutedIcon.vue';
import PaginationDefault from '@/components/pagination/PaginationDefault.vue';
import { useWorkspaceStore } from '@/stores/workspace-store';
import { defineRole } from '@/utils/permissions';
import { toast } from '@/modules/toast';
import ProjectContextMenu from './ProjectContextMenu.vue';
import ProjectNotificationsDialog from './ProjectNotificationsDialog.vue';
import { useWorkspaceProjectList } from '../composables/useWorkspaceProjectList';
import { useProjectMemberships } from '../composables/useProjectMemberships';
import { formatProjectEmoji } from '../model/project-emoji';
import { getProjectRoute } from '../model/project-routes';
import {
  canConfigureProjectNotifications,
  hasProjectPermission,
} from '../model/project-permissions';
import type { ProjectNotificationTarget } from '../model/project-notifications';

const props = defineProps<{ workspaceSlug: string }>();
const router = useRouter();
const { t } = useI18n();
const workspaceSlug = toRef(props, 'workspaceSlug');
const { meInWorkspace, workspaceProjects } = storeToRefs(useWorkspaceStore());
const { search, query, projects, loading } = useWorkspaceProjectList(workspaceSlug);
const membershipProjects = computed(() =>
  query.value
    ? [...workspaceProjects.value, ...projects.value]
    : workspaceProjects.value,
);
const { memberships, membershipsLoading } = useProjectMemberships(
  workspaceSlug,
  membershipProjects,
);
const page = ref(1);
const rowsPerPage = ref(10);
const contextOpen = ref(false);
const contextProject = ref<DtoProjectLight | null>(null);
const contextPosition = ref<[number, number]>([0, 0]);
const notificationTarget = ref<ProjectNotificationTarget | null>(null);
const headers = computed<DataTableHeader<DtoProjectLight>[]>(() => [
  {
    key: 'emoji',
    title: t('projects.columns.emoji'),
    align: 'center',
    sortable: false,
  },
  { key: 'name', title: t('projects.columns.name'), sortable: true, nowrap: true },
  { key: 'identifier', title: t('projects.columns.identifier'), sortable: true },
  {
    key: 'total_members',
    title: t('projects.columns.total_members'),
    sortable: true,
    nowrap: true,
  },
  {
    key: 'copy_link',
    title: t('projects.columns.copy_link'),
    align: 'center',
    sortable: false,
  },
  {
    key: 'task_notifications',
    title: t('projects.taskNotifications'),
    align: 'center',
    sortable: false,
    nowrap: true,
  },
  {
    key: 'project_notifications',
    title: t('projects.projectNotifications'),
    align: 'center',
    sortable: false,
    nowrap: true,
  },
]);

watch(query, () => {
  page.value = 1;
});
watch(workspaceSlug, () => {
  page.value = 1;
  contextOpen.value = false;
  contextProject.value = null;
  notificationTarget.value = null;
});

function getMembership(project: DtoProjectLight) {
  return project.id ? memberships.value[project.id] : undefined;
}

function canAccessProject(project: DtoProjectLight) {
  return (
    !!project.id &&
    (!!getMembership(project)?.role ||
      defineRole(meInWorkspace.value.role ?? 0) === 'admin')
  );
}

function openProject(project: DtoProjectLight) {
  const route = getProjectRoute(workspaceSlug.value, project);
  if (!route) return;
  if (canAccessProject(project)) {
    void router.push(route);
  } else if (!membershipsLoading.value) {
    toast.error(t('projects.accessDenied'));
  }
}

function onRowClick(_: MouseEvent, { item }: { item: DtoProjectLight }) {
  openProject(item);
}

function getRowProps({ item }: { item: DtoProjectLight }) {
  return {
    class: 'project-table-row',
    tabindex: 0,
    onKeydown: (event: KeyboardEvent) => {
      if (event.key !== 'Enter' || event.target !== event.currentTarget) return;
      event.preventDefault();
      openProject(item);
    },
  };
}

async function openContextMenu(
  event: MouseEvent,
  { item: project }: { item: DtoProjectLight },
) {
  event.preventDefault();
  contextOpen.value = false;
  if (!canAccessProject(project)) return;
  contextProject.value = project;
  contextPosition.value = [event.clientX, event.clientY];
  await nextTick();
  contextOpen.value = true;
}

async function copyLink(project: DtoProjectLight) {
  const route = getProjectRoute(workspaceSlug.value, project);
  if (!route) return;
  try {
    const { href } = router.resolve(route);
    await navigator.clipboard.writeText(new URL(href, window.location.href).href);
  } catch {
    toast.error();
  }
}

function openNotifications(
  project: DtoProjectLight,
  kind: ProjectNotificationTarget['kind'],
) {
  if (!project.id) return;
  notificationTarget.value = {
    kind,
    workspaceSlug: workspaceSlug.value,
    projectId: project.id,
    projectName: project.name ?? '',
  };
}
</script>

<style scoped>
.projects-table {
  --v-table-header-height: 48px;
  --v-table-row-height: 48px;
  --v-border-opacity: 0.28;
}

.projects-table :deep(th),
.projects-table :deep(td),
.projects-table-pagination {
  font-size: 0.75rem;
}

.projects-table :deep(.project-table-row) {
  cursor: pointer;
}
</style>
