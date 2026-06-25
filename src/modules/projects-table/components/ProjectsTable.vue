<template>
  <div>
    <q-input
      v-model="projectSearch"
      class="base-input q-mb-md"
      label="Поиск"
      dense
      clearable
      @update:model-value="searchProjects"
    />
    <q-table
      flat
      bordered
      :rows="displayedProjects"
      :columns="columns"
      :rows-per-page-options="[10, 25, 50]"
      :loading="isLoading"
      @row-click="(_, row) => toProjectPage(row)"
      @row-contextmenu.prevent="onRowContextMenu"
    >
      <template v-slot:body-cell-copy_link="props">
        <q-td :props="props">
          <q-btn
            class="btn-only-icon-sm"
            dense
            flat
            no-caps
            no-wrap
            @click.stop="copyLink(props.row)"
          >
            <LinkIcon />
          </q-btn>
        </q-td>
      </template>

      <template v-slot:body-cell-notifications="props">
        <q-td :props="props">
          <q-btn
            class="btn-only-icon-sm"
            dense
            flat
            no-caps
            no-wrap
            :disable="!isAccessToProject(props.row.id)"
            @click.stop="openNotificationSettings(props.row)"
          >
            <UnmutedIcon />
          </q-btn>
        </q-td>
      </template>

      <template v-slot:body-cell-admin_notifications="props">
        <q-td :props="props">
          <q-btn
            v-if="isAdminProject(props.row.id)"
            class="btn-only-icon-sm"
            dense
            flat
            no-caps
            no-wrap
            @click.stop="openNotificationsAdminSettings(props.row)"
          >
            <UnmutedIcon />
          </q-btn>
        </q-td>
      </template>
    </q-table>

    <NotificationsSettingsDialog
      v-model="isNotificationsSettingsOpen"
      :project="selectedProject"
    />
    <NotificationsAdminProjectSettingsDialog
      v-model="isNotificationsAdminSettingsOpen"
      :project="selectedProject"
    />
    <ProjectContextMenu
      :project="contextRow"
      :anchor-event="contextEvent"
      @reset-context="onResetContext"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { QTableColumn, debounce } from 'quasar';

import { DtoProjectLight } from '@aisa-it/aiplan-api-ts/src/data-contracts';

import { copyLinkToClipboard } from 'src/utils/copyLinkToClipboard';

import LinkIcon from 'src/components/icons/LinkIcon.vue';
import NotificationsSettingsDialog from 'src/components/dialogs/NotificationsSettingsDialog.vue';
import NotificationsAdminProjectSettingsDialog from 'src/components/dialogs/NotificationsAdminProjectSettingsDialog.vue';
import UnmutedIcon from 'src/components/icons/UnmutedIcon.vue';
import ProjectContextMenu from 'src/shared/components/ProjectContextMenu.vue';
import { useRolesStore } from 'src/stores/roles-store';
import { useWorkspaceStore } from 'src/stores/workspace-store';
import { useNotificationStore } from 'src/stores/notification-store';
import { storeToRefs } from 'pinia';

import { getWorkspaceProjects } from '../api';
import { BASE_ERROR_RULES } from 'src/constants/notifications';

const { getProjectRole, getWsRole } = useRolesStore();
const { setNotificationView } = useNotificationStore();

const route = useRoute();
const router = useRouter();
const projectSearch = ref('');
const filteredProjects = ref<DtoProjectLight[] | undefined>(undefined);
const isNotificationsSettingsOpen = ref(false);
const isNotificationsAdminSettingsOpen = ref(false);
const contextRow = ref<DtoProjectLight | null>(null);
const contextEvent = ref<MouseEvent | null>(null);
const selectedProject = ref<DtoProjectLight>();
const isLoading = ref(false);

const workspaceStore = useWorkspaceStore();
const { workspaceProjects } = storeToRefs(workspaceStore);

const columns: QTableColumn<DtoProjectLight>[] = [
  {
    name: 'emoji',
    align: 'center',
    label: 'Эмодзи',
    sortable: false,
    style: () => 'width: 14px',
    field: (row) => String.fromCodePoint(parseInt(row.emoji as string)),
  },
  {
    name: 'name',
    align: 'left',
    label: 'Имя',
    sortable: true,
    field: (row) => row.name,
  },

  {
    name: 'identifier',
    align: 'left',
    label: 'Идентификатор',
    sortable: true,
    field: (row) => row.identifier,
  },
  {
    name: 'total_members',
    align: 'left',
    label: 'Кол-во участников',
    sortable: true,
    field: (row) => row.total_members,
  },
  {
    name: 'copy_link',
    align: 'center',
    label: 'Ссылка',
    field: (row) => row,
  },
  {
    name: 'notifications',
    align: 'center',
    label: 'Уведомления задач',
    field: (row) => row,
  },
  {
    name: 'admin_notifications',
    align: 'center',
    label: 'Уведомления проекта',
    field: (row) => row,
  },
];

const onRowContextMenu = (evt: Event, row: DtoProjectLight | null) => {
  if (!row || (row.id && !isAccessToProject(row.id))) {
    onResetContext();
    return;
  }
  contextRow.value = row;
  contextEvent.value = evt as MouseEvent;
};

const onResetContext = () => {
  contextRow.value = null;
  contextEvent.value = null;
};

const displayedProjects = computed(
  () => filteredProjects.value ?? workspaceProjects.value,
);

onMounted(async () => {
  isLoading.value = true;
  await workspaceStore.getWorkspaceProjects(route.params.workspace as string);
  isLoading.value = false;
});

const copyLink = (project: DtoProjectLight) => {
  copyLinkToClipboard('project', {
    workspaceSlug: route.params.workspace as string,
    projectIdentifier: project.identifier,
  });
};

const toProjectPage = (row: DtoProjectLight) => {
  if (row.id && !isAccessToProject(row.id)) {
    setNotificationView({
      type: 'error',
      customMessage: BASE_ERROR_RULES,
      open: true,
    });
    return;
  }
  router.push(`projects/${row.identifier}/issues`);
};

const isAccessToProject = (projectId: string) => {
  return (
    !!getProjectRole(projectId) ||
    getWsRole(route.params.workspace as string) === 15
  );
};

const isAdminProject = (projectId: string) => {
  return getProjectRole(projectId) === 15;
};

const openNotificationSettings = (project: DtoProjectLight) => {
  selectedProject.value = project;
  isNotificationsSettingsOpen.value = true;
};

const openNotificationsAdminSettings = (project: DtoProjectLight) => {
  selectedProject.value = project;
  isNotificationsAdminSettingsOpen.value = true;
};

const searchProjects = debounce(async () => {
  if (!projectSearch.value.trim()) {
    filteredProjects.value = undefined;
    return;
  }
  isLoading.value = true;
  try {
    filteredProjects.value =
      (await getWorkspaceProjects(
        route.params.workspace as string,
        projectSearch.value,
      )) ?? [];
  } finally {
    isLoading.value = false;
  }
}, 500);
</script>
