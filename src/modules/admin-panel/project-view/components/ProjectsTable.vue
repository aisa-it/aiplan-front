<template>
  <q-table
    v-model:pagination="pagination"
    flat
    row-key="slug"
    loading-label="Загружается..."
    no-data-label="Нет данных"
    :rows="rows"
    :columns="columns"
    :rows-per-page-options="[10, 25, 50, 100]"
    class="table-bottom-reverse"
    @request="refresh"
  >
    <template #pagination>
      <PaginationDefault
        v-model:selected-page="pagination.page"
        :rows-number="pagination.rowsNumber"
        :rows-per-page="pagination.rowsPerPage"
        @update:selectedPage="refresh({ pagination }, searchQuery)"
      />
    </template>

    <template v-slot:body-cell-name="props">
      <q-td :props="props">
        <span v-html="props.row.name_highlighted"></span
      ></q-td>
    </template>

    <template v-slot:body-cell-settings="props">
      <q-td :props="props">
        <SettingsButton @click.stop="onEditProject(props.row)" />
      </q-td>
    </template>

    <template v-slot:no-data>
      <EmptyStateTable :loading="loading" title="Нет проектов">
        <DocumentIcon :width="56" :height="56" />
      </EmptyStateTable>
    </template>
  </q-table>
  <SettingsProjectDialog
    v-model="isSettingsDialogOpen"
    :project="selectedProject"
    :user-id="user.id"
    :is-workspace-member="isWorkspaceMember"
    @success="onSettingsSuccess"
    @error="onSettingsError"
  />
</template>

<script setup lang="ts">
import { toRefs, computed, watch, ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { api } from '../services/api';

import { columns } from '../columnConfig';

import DocumentIcon from 'src/components/icons/DocumentIcon.vue';
import PaginationDefault from 'src/components/pagination/PaginationDefault.vue';
import EmptyStateTable from '../../ui/EmptyStateTable.vue';
import SettingsButton from '../../ui/SettingsButton.vue';
import SettingsProjectDialog from './ui/SettingsProjectDialog.vue';

import { useTableWithPagination } from '../../composables/useTableWithPagination';
import { DtoProject } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { apiWrapperWithIds } from '../../services/wrappers';
import { useUserStore } from 'src/stores/user-store';
import { useNotificationStore } from 'src/stores/notification-store';

const props = defineProps<{ searchQuery: string | undefined }>();

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const { setNotificationView } = useNotificationStore();
const { searchQuery } = toRefs(props);
const { userWorkspacesMemberships, userProjectsMemberships, user } =
  storeToRefs(userStore);
const isSettingsDialogOpen = ref(false);
const selectedProject = ref();
const isWorkspaceMember = ref(false);
const workspaceId = computed(() => route.params.workspace as string);

const { loading, rows, pagination, refresh } =
  useTableWithPagination<DtoProject>(
    apiWrapperWithIds<DtoProject, [string]>(api.getWsProjects),
    [workspaceId.value],
  );

const onEditProject = (project: DtoProject) => {
  if (!project.id) return;
  const role = userProjectsMemberships.value[project.id]?.role;
  if (role && role === 15) {
    router.push(
      `/${project.workspace_detail?.slug}/projects/${project.id}/settings`,
    );
  } else {
    selectedProject.value = project;
    isWorkspaceMember.value =
      !!userWorkspacesMemberships.value[project.workspace_detail?.id ?? ''];
    isSettingsDialogOpen.value = true;
  }
};

const onSettingsSuccess = () => {
  isSettingsDialogOpen.value = false;
  router.push(
    `/${selectedProject.value.workspace_detail?.slug}/projects/${selectedProject.value.id}/settings`,
  );
  selectedProject.value = undefined;
  isWorkspaceMember.value = false;
};

const onSettingsError = () => {
  selectedProject.value = undefined;
  isWorkspaceMember.value = false;
  isSettingsDialogOpen.value = false;
  setNotificationView({
    open: true,
    type: 'error',
    customMessage: 'Ошибка при редактировании проекта',
  });
};

watch(
  [workspaceId, searchQuery],
  () => {
    refresh({ pagination: pagination.value }, searchQuery.value);
  },
  { immediate: true },
);

onMounted(async () => {
  await userStore.getUserWorkspacesMemberships();
  await userStore.getUserProjectsMemberships()
});
</script>
