<template>
  <q-table
    v-model:pagination="pagination"
    flat
    row-key="slug"
    :rows="rows"
    :columns="columns"
    :rows-per-page-options="[10, 25, 50, 100]"
    class="table-bottom-reverse"
    @request="refresh"
    @row-click="onRowClick"
  >
    <template #pagination>
      <PaginationDefault
        v-model:selected-page="pagination.page"
        :rows-number="pagination.rowsNumber"
        :rows-per-page="pagination.rowsPerPage"
        @update:selectedPage="refresh({ pagination }, searchQuery)"
      />
    </template>

    <template v-slot:body-cell-avatar="props">
      <q-td :props="props">
        <AvatarImage
          :rounded="false"
          :image="props.row.logo ? `${props.row.logo}` : ''"
          :text="props.row.name[0]?.toUpperCase()"
          :tooltip="props.row.name"
        ></AvatarImage>
      </q-td>
    </template>

    <template v-slot:body-cell-name="props">
      <q-td :props="props"
        ><span v-html="props.row.name_highlighted"></span
      ></q-td>
    </template>

    <template v-slot:body-cell-settings="props">
      <q-td :props="props">
        <SettingsButton @click.stop="onEditWs(props.row)" />
        <q-btn
          flat
          dense
          class="q-ml-sm"
          style="font-size: 14px"
          @click.stop="openDeleteDialog(props.row)"
        >
          <BinIcon color="#DC3E3E" />
        </q-btn>
      </q-td>
    </template>

    <template v-slot:no-data>
      <div class="column flex-center" style="width: 100%; height: 75vh">
        <DefaultLoader v-if="loading" />

        <div v-if="!loading && !rows.length" class="column flex-center">
          <DocumentIcon :width="56" :height="56" />
          <h6>Нет пространств</h6>
        </div>
      </div>
    </template>
  </q-table>

  <DeleteWsDialog
    v-model="isDeleteDialogOpen"
    :workspace="selectedWorkspace"
    @success="onDeleteSuccess"
    @error="onDeleteError"
  />
  <SettingsWsDialog
    v-model="isSettingsDialogOpen"
    :workspace="selectedWorkspace"
    :user-id="user.id"
    @success="onSettingsSuccess"
    @error="onSettingsError"
  />
</template>

<script setup lang="ts">
//core
import { toRefs, watch, ref, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';

//stores
import { useNotificationStore } from 'src/stores/notification-store';
import { useUserStore } from 'src/stores/user-store';

//types
import { DtoWorkspaceWithCount } from '@aisa-it/aiplan-api-ts/src/data-contracts';

//config
import { columns } from '../columnConfig';

//api
import { api } from '../services/api';

//composables
import { useTableWithPagination } from '../../composables/useTableWithPagination';
import { useTableRowClick } from '../../composables/useTableRowClick';

//icons
import BinIcon from 'src/components/icons/BinIcon.vue';

//components
import AvatarImage from 'src/components/AvatarImage.vue';
import DocumentIcon from 'src/components/icons/DocumentIcon.vue';
import DefaultLoader from 'src/components/loaders/DefaultLoader.vue';
import PaginationDefault from 'src/components/pagination/PaginationDefault.vue';
import SettingsButton from '../../ui/SettingsButton.vue';
import DeleteWsDialog from '../components/ui/DeleteWsDialog.vue';
import SettingsWsDialog from './ui/SettingsWsDialog.vue';

const props = defineProps<{ searchQuery: string | undefined }>();

const userStore = useUserStore();
const router = useRouter();

const { searchQuery } = toRefs(props);
const { userWorkspacesMemberships, user } = storeToRefs(userStore);

//stores
const { setNotificationView } = useNotificationStore();

//composables
const { loading, rows, pagination, refresh } =
  useTableWithPagination<DtoWorkspaceWithCount>(api.getWorkspaces);

const { onRowClick } = useTableRowClick();

//ref
const isDeleteDialogOpen = ref(false);
const isSettingsDialogOpen = ref(false);
const selectedWorkspace = ref<DtoWorkspaceWithCount>();

//methods
const openDeleteDialog = (workspace: DtoWorkspaceWithCount) => {
  selectedWorkspace.value = workspace;
  isDeleteDialogOpen.value = true;
};

const onDeleteSuccess = () => {
  isDeleteDialogOpen.value = false;
  selectedWorkspace.value = undefined;
  setNotificationView({
    open: true,
    type: 'success',
    customMessage: 'Пространство успешно удалено',
  });
  refresh({ pagination: pagination.value }, searchQuery.value);
};

const onDeleteError = () => {
  isDeleteDialogOpen.value = false;
  setNotificationView({
    open: true,
    type: 'error',
    customMessage: 'Ошибка при удалении пространства',
  });
};

const onSettingsSuccess = () => {
  isSettingsDialogOpen.value = false;
  router.push(`${selectedWorkspace.value?.slug}/workspace-settings`);
  selectedWorkspace.value = undefined;
};

const onSettingsError = () => {
  isSettingsDialogOpen.value = false;
  setNotificationView({
    open: true,
    type: 'error',
    customMessage: 'Ошибка при редактировании простраства',
  });
};

const onEditWs = (workspace: DtoWorkspaceWithCount) => {
  if (!workspace.id) return;
  const role = userWorkspacesMemberships.value[workspace.id]?.role;
  if (role && role === 15) {
    router.push(`${workspace.slug}/workspace-settings`);
  } else {
    selectedWorkspace.value = workspace;
    isSettingsDialogOpen.value = true;
  }
};

watch(searchQuery, (newVal) => {
  refresh({ pagination: pagination.value }, newVal);
});

onMounted(async () => {
  await userStore.getUserWorkspacesMemberships();
});
</script>
