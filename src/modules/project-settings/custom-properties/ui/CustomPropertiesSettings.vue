<template>
  <div class="q-pr-md q-pl-md">
    <div class="row items-center justify-between q-mb-md">
      <span
        :class="{ 'text-h6': $q.screen.lt.sm }"
        class="font-semibold"
        style="font-size: 24px"
      >
        Кастомные параметры
      </span>
      <q-btn
        class="primary-btn"
        icon="add"
        label="Создать"
        dense
        @click="openCreateModal"
        no-caps
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
        v-if="localTemplates.length === 0 && !isLoading"
        class="text-grey q-mt-md"
      >
        Нет кастомных параметров. Создайте первый параметр.
      </div>
      <div
        class="list-container"
        ref="listContainerRef"
        :key="listKey"
        @update.stop
        @add.stop
        @remove.stop
      >
        <CustomPropertyItem
          v-for="item in localTemplates"
          :key="item.id"
          :data-id="item.id"
          :item="item"
          @edit="openEditModal"
          @delete="confirmDelete"
        />
      </div>
    </div>

    <CustomPropertyEditModal
      v-model="showModal"
      :edit-item="editingItem"
      @submit="handleModalSubmit"
    />

    <CustomPropertyDeleteModal
      v-model="showDeleteModal"
      @confirm="handleDelete"
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
import CustomPropertyItem from './CustomPropertyItem.vue';
import CustomPropertyEditModal from './CustomPropertyEditModal.vue';
import CustomPropertyDeleteModal from './CustomPropertyDeleteModal.vue';
import DefaultLoader from 'src/components/loaders/DefaultLoader.vue';

//services
import {
  PropertyTemplate,
  getPropertyTemplates,
  createPropertyTemplate,
  updatePropertyTemplate,
  deletePropertyTemplate,
} from '../services/api';

//composables
import { useSortable } from 'src/composables/useSortable';

//stores
const projectStore = useProjectStore();
const workspaceStore = useWorkspaceStore();
const { setNotificationView } = useNotificationStore();
const { currentProjectID } = storeToRefs(projectStore);
const { currentWorkspaceSlug } = storeToRefs(workspaceStore);

//variables
const templates = ref<PropertyTemplate[]>([]);
const localTemplates = ref<PropertyTemplate[]>([]);
const isLoading = ref(false);

const showModal = ref(false);
const editingItem = ref<PropertyTemplate | null>(null);

const showDeleteModal = ref(false);
const itemToDelete = ref<PropertyTemplate | null>(null);

const listContainerRef = ref<HTMLElement | null>(null);
const listKey = ref(0);
const saveTimer = ref<ReturnType<typeof setTimeout> | null>(null);

//methods
const fetchData = async () => {
  isLoading.value = true;
  try {
    const data = await getPropertyTemplates(
      currentWorkspaceSlug.value as string,
      currentProjectID.value,
    );

    templates.value = Array.isArray(data) ? data : (data as any).result || [];
    templates.value.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
    localTemplates.value = [...templates.value];
  } catch (e) {
    console.error(e);
    setNotificationView({
      open: true,
      type: 'error',
      customMessage: 'Ошибка получения данных',
    });
  } finally {
    isLoading.value = false;
    await initSortable();
  }
};

const openCreateModal = () => {
  editingItem.value = null;
  showModal.value = true;
};

const openEditModal = (item: PropertyTemplate) => {
  editingItem.value = item;
  showModal.value = true;
};

const handleModalSubmit = async (data: PropertyTemplate) => {
  try {
    if (editingItem.value && editingItem.value.id) {
      await updatePropertyTemplate(
        currentWorkspaceSlug.value as string,
        currentProjectID.value,
        editingItem.value.id,
        data as any,
      );
      setNotificationView({
        open: true,
        type: 'success',
        customMessage: 'Параметр обновлен',
      });
    } else {
      await createPropertyTemplate(
        currentWorkspaceSlug.value as string,
        currentProjectID.value,
        data as any,
      );
      setNotificationView({
        open: true,
        type: 'success',
        customMessage: 'Параметр создан',
      });
    }
    showModal.value = false;
    await fetchData();
  } catch (e) {
    console.error(e);
    setNotificationView({
      open: true,
      type: 'error',
      customMessage: 'Ошибка сохранения',
    });
  }
};

const confirmDelete = (item: PropertyTemplate) => {
  itemToDelete.value = item;
  showDeleteModal.value = true;
};

const handleDelete = async () => {
  if (!itemToDelete.value?.id) return;
  try {
    await deletePropertyTemplate(
      currentWorkspaceSlug.value as string,
      currentProjectID.value,
      itemToDelete.value.id,
    );
    setNotificationView({
      open: true,
      type: 'success',
      customMessage: 'Параметр удален',
    });
    await fetchData();
  } catch (e) {
    console.error(e);
    setNotificationView({
      open: true,
      type: 'error',
      customMessage: 'Ошибка удаления',
    });
  } finally {
    showDeleteModal.value = false;
    itemToDelete.value = null;
  }
};

const { initSortable } = useSortable(listContainerRef, {
  draggable: '.list-item',
  handle: '.drag-handle',
  ghostClass: 'sortable-ghost',
  animation: 150,
  forceFallback: true,
  fallbackOnBody: true,
  fallbackTolerance: 5,
  onStart: () => {
    if (saveTimer.value !== null) {
      clearTimeout(saveTimer.value);
      saveTimer.value = null;
    }
  },
  onEnd: async ({ oldIndex, newIndex, evt }) => {
    evt.stopPropagation();
    evt.preventDefault();
    if (oldIndex === newIndex) return;

    const movedItem = localTemplates.value.splice(oldIndex, 1)[0];
    localTemplates.value.splice(newIndex, 0, movedItem);

    listKey.value += 1;
    await initSortable();

    saveTimer.value = setTimeout(async () => {
      try {
        const promises = <Promise<any>[]>[];

        localTemplates.value.forEach((item, index) => {
          if (item.sort_order !== index) {
            if (item.id) {
              promises.push(
                updatePropertyTemplate(
                  currentWorkspaceSlug.value as string,
                  currentProjectID.value,
                  item.id,
                  { sort_order: index },
                ),
              );
            }
          }
        });

        if (promises.length > 0) {
          isLoading.value = true;
          await Promise.all(promises);

          await fetchData();
        }
      } catch (e) {
        setNotificationView({
          open: true,
          type: 'error',
          customMessage: 'Ошибка cортировки',
        });
        await fetchData();
      }
    }, 2000);
  },
});

//lifecycle hooks
onMounted(fetchData);
</script>

<style scoped>
:deep(.sortable-ghost) {
  opacity: 0.5;
}
</style>
