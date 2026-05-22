<template>
  <div>
    <q-table
      flat
      bordered
      :rows="projects"
      :columns="columns"
      :rows-per-page-options="[10, 25, 50]"
      @row-click="
        (event, row) => router.push(`projects/${row.identifier}/issues`)
      "
    >
      <template v-slot:body-cell-copy_link="props">
        <q-td :props="props">
          <q-btn
            class="btn-only-icon-sm"
            dense
            flat
            no-caps
            no-wrap
            @click.prevent.stop="copyLink(props.row)"
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
            @click.prevent.stop="openNotificationSettings(props.row)"
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
            @click.prevent.stop="openNotificationsAdminSettings(props.row)"
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
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { QTableColumn } from 'quasar';

import { getWorkspaceProjects } from '../api';
import { DtoProjectLight } from '@aisa-it/aiplan-api-ts/src/data-contracts';

import { copyLinkToClipboard } from 'src/utils/copyLinkToClipboard';

import LinkIcon from 'src/components/icons/LinkIcon.vue';
import NotificationsSettingsDialog from 'src/components/dialogs/NotificationsSettingsDialog.vue';
import NotificationsAdminProjectSettingsDialog from 'src/components/dialogs/NotificationsAdminProjectSettingsDialog.vue';
import UnmutedIcon from 'src/components/icons/UnmutedIcon.vue';

import { useRolesStore } from 'src/stores/roles-store';

const { getProjectRole } = useRolesStore();

const route = useRoute();
const router = useRouter();
const projects = ref<DtoProjectLight[]>([]);

const isNotificationsSettingsOpen = ref(false);
const isNotificationsAdminSettingsOpen = ref(false);

const selectedProject = ref<DtoProjectLight>();

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

onMounted(async () => {
  projects.value = await getWorkspaceProjects(route.params.workspace as string);
});

const copyLink = (project: DtoProjectLight) => {
  copyLinkToClipboard('project', {
    workspaceSlug: route.params.workspace as string,
    projectIdentifier: project.identifier,
  });
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
</script>
