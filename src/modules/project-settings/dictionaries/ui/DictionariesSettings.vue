<template>
  <div class="q-pr-md q-pl-md">
    <div class="row items-center justify-between q-mb-md">
      <span class="font-semibold" style="font-size: 24px">Справочники</span>
      <q-btn
        class="primary-btn"
        icon="add"
        label="Создать"
        dense
        no-caps
        @click="openCreateModal"
      />
    </div>

    <div style="position: relative; min-height: 200px">
      <q-inner-loading
        style="z-index: 999; position: absolute"
        :showing="isLoading"
      >
        <DefaultLoader />
      </q-inner-loading>

      <div
        v-if="dictionaries.length === 0 && !isLoading"
        class="text-grey q-mt-md"
      >
        Нет справочников. Создайте первый справочник.
      </div>

      <div
        v-for="item in dictionaries"
        :key="item.id"
        class="q-pa-md q-mb-sm rounded-borders row items-center bordered-table"
      >
        <div class="col cursor-pointer" @click="openRows(item)">
          <h6 class="font-medium q-ma-none word-wrap" style="margin: 0 !important">
            {{ item.name }}
          </h6>
          <div class="text-caption text-grey">Строк: {{ item.rows_count || 0 }}</div>
        </div>

        <div class="buttons row no-wrap q-ml-auto">
          <q-btn dense flat @click="openRows(item)">
            <q-icon name="list" size="20px" color="grey" />
            <HintTooltip> Строки </HintTooltip>
          </q-btn>

          <q-btn dense flat @click="openEditModal(item)">
            <EditIcon />
            <HintTooltip> Переименовать </HintTooltip>
          </q-btn>

          <q-btn dense flat @click="confirmDelete(item)">
            <BinIcon color="#DC3E3E" />
            <HintTooltip> Удалить </HintTooltip>
          </q-btn>
        </div>
      </div>
    </div>

    <DictionaryEditModal
      v-model="showEditModal"
      :edit-item="editingItem"
      @submit="handleEditSubmit"
    />

    <DictionaryDeleteModal
      v-model="showDeleteModal"
      :item-name="itemToDelete?.name"
      @confirm="handleDelete"
    />

    <DictionaryRowsDialog
      v-model="showRowsDialog"
      :dictionary="activeDictionary"
      @changed="fetchData"
    />
  </div>
</template>

<script setup lang="ts">
//core
import { ref, onMounted } from 'vue';
import { storeToRefs } from 'pinia';

//stores
import { useProjectStore } from 'src/stores/project-store';
import { useWorkspaceStore } from 'src/stores/workspace-store';
import { useNotificationStore } from 'src/stores/notification-store';

//components
import DictionaryEditModal from './DictionaryEditModal.vue';
import DictionaryDeleteModal from './DictionaryDeleteModal.vue';
import DictionaryRowsDialog from './DictionaryRowsDialog.vue';
import DefaultLoader from 'src/components/loaders/DefaultLoader.vue';
import EditIcon from 'src/components/icons/EditIcon.vue';
import BinIcon from 'src/components/icons/BinIcon.vue';
import HintTooltip from 'src/components/HintTooltip.vue';

//services
import {
  Dictionary,
  getDictionaries,
  createDictionary,
  updateDictionary,
  deleteDictionary,
  DICTIONARY_IN_USE_ERROR_CODE,
} from '../services/api';

//stores
const projectStore = useProjectStore();
const workspaceStore = useWorkspaceStore();
const { setNotificationView } = useNotificationStore();
const { currentProjectID } = storeToRefs(projectStore);
const { currentWorkspaceSlug } = storeToRefs(workspaceStore);

//variables
const dictionaries = ref<Dictionary[]>([]);
const isLoading = ref(false);

const showEditModal = ref(false);
const editingItem = ref<Dictionary | null>(null);

const showDeleteModal = ref(false);
const itemToDelete = ref<Dictionary | null>(null);

const showRowsDialog = ref(false);
const activeDictionary = ref<Dictionary | null>(null);

//methods
const fetchData = async () => {
  isLoading.value = true;
  try {
    const data = await getDictionaries(
      currentWorkspaceSlug.value as string,
      currentProjectID.value,
    );
    dictionaries.value = Array.isArray(data) ? data : [];
  } catch (e) {
    console.error(e);
    setNotificationView({
      open: true,
      type: 'error',
      customMessage: 'Ошибка получения данных',
    });
  } finally {
    isLoading.value = false;
  }
};

const openCreateModal = () => {
  editingItem.value = null;
  showEditModal.value = true;
};

const openEditModal = (item: Dictionary) => {
  editingItem.value = item;
  showEditModal.value = true;
};

const handleEditSubmit = async (data: { name: string }) => {
  try {
    if (editingItem.value?.id) {
      await updateDictionary(
        currentWorkspaceSlug.value as string,
        currentProjectID.value,
        editingItem.value.id,
        data,
      );
      setNotificationView({
        open: true,
        type: 'success',
        customMessage: 'Справочник переименован',
      });
    } else {
      await createDictionary(
        currentWorkspaceSlug.value as string,
        currentProjectID.value,
        data,
      );
      setNotificationView({
        open: true,
        type: 'success',
        customMessage: 'Справочник создан',
      });
    }
    showEditModal.value = false;
    await fetchData();
  } catch (e: any) {
    console.error(e);
    setNotificationView({
      open: true,
      type: 'error',
      customMessage: 'Ошибка сохранения',
    });
  }
};

const confirmDelete = (item: Dictionary) => {
  itemToDelete.value = item;
  showDeleteModal.value = true;
};

const handleDelete = async () => {
  if (!itemToDelete.value?.id) return;
  try {
    await deleteDictionary(
      currentWorkspaceSlug.value as string,
      currentProjectID.value,
      itemToDelete.value.id,
    );
    setNotificationView({
      open: true,
      type: 'success',
      customMessage: 'Справочник удален',
    });
    await fetchData();
  } catch (e: any) {
    console.error(e);
    // 4513 — справочник используется полями проекта
    if (e?.response?.data?.code === DICTIONARY_IN_USE_ERROR_CODE) {
      setNotificationView({
        open: true,
        type: 'error',
        customMessage: 'Справочник используется полями проекта, удаление невозможно',
      });
    } else {
      setNotificationView({
        open: true,
        type: 'error',
        customMessage: 'Ошибка удаления',
      });
    }
  } finally {
    showDeleteModal.value = false;
    itemToDelete.value = null;
  }
};

const openRows = (item: Dictionary) => {
  activeDictionary.value = item;
  showRowsDialog.value = true;
};

//lifecycle hooks
onMounted(fetchData);
</script>
