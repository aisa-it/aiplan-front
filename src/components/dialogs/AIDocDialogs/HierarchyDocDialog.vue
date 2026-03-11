<template>
  <q-dialog
    class="doc-hierarchy-dialog"
    :persistent="isSaving"
    @show="onDialogShow"
    @hide="onDialogHide"
  >
    <q-card class="doc-hierarchy-card">
      <q-card-section class="column q-pt-none">
        <h6 class="q-ml-md">Иерархия документов</h6>

        <div v-if="pendingMoves.length > 0" class="text-caption text-warning">
          Перемещено документов: {{ pendingMoves.length }}
        </div>

        <ul class="sortable visible-scroll" ref="rootSortableRef">
          <HierarchyDocDialogItem
            v-for="item in hierarchyRoots"
            :key="item.id"
            :item="item"
            :on-sortable-end="handleSortableEnd"
            class="nested"
            @sortable-refresh="initAllSortables"
          />
          <li class="sortable-end"></li>
        </ul>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn
          flat
          no-caps
          label="Отмена"
          class="btn"
          color="negative"
          @click="clearChanges"
          :disable="!isSaving"
        />
        <q-btn
          flat
          no-caps
          label="Сохранить"
          class="btn primary-btn"
          color="primary"
          @click="saveChanges"
          :disable="!isSaving"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts" setup>
import { ref, nextTick, onBeforeUnmount, watch } from 'vue';
import Sortable from 'sortablejs';
import { storeToRefs } from 'pinia';
import { useWorkspaceStore } from 'src/stores/workspace-store';
import { useAiDocStore } from 'src/stores/aidoc-store';
import HierarchyDocDialogItem from '../HierarchyDocDialogItem.vue';
import { DtoDocLight } from '@aisa-it/aiplan-api-ts/src/data-contracts';

export interface DtoDocLightWithChildren extends DtoDocLight {
  children?: DtoDocLightWithChildren[];
  isExpanded?: boolean;
  isLoadingChildren?: boolean;
}

interface MoveOperation {
  docId: string;
  newParentId: string | undefined;
  prevId: string | undefined;
  nextId: string | undefined;
  oldIndex: number;
  newIndex: number;
  fromEl: HTMLElement;
  toEl: HTMLElement;
}

const workspaceStore = useWorkspaceStore();
const docStore = useAiDocStore();
const { currentWorkspaceSlug } = storeToRefs(workspaceStore);

const hierarchyRoots = ref<DtoDocLightWithChildren[]>([]);
const pendingMoves = ref<MoveOperation[]>([]);
const isSaving = ref(false);
const rootSortableRef = ref<HTMLElement | null>(null);
let sortableInstances: Sortable[] = [];

const buildHierarchy = async (
  docs: DtoDocLight[],
): Promise<DtoDocLightWithChildren[]> => {
  const promises = docs.map(async (doc) => {
    const item: DtoDocLightWithChildren = { ...doc };
    if (doc.has_child_docs && doc.id) {
      const childResponse = await docStore.getChildDocList(
        currentWorkspaceSlug.value!,
        doc.id,
      );
      item.children = await buildHierarchy(childResponse.data);
    } else {
      item.children = [];
    }
    return item;
  });
  return Promise.all(promises);
};

const updateHierarchy = async () => {
  if (!currentWorkspaceSlug.value) return;
  await docStore.getRootDocs(currentWorkspaceSlug.value);

  hierarchyRoots.value = docStore.rootDocs.map((doc) => ({
    ...doc,
    children: [],
    isExpanded: false,
    isLoadingChildren: false,
  }));

  await nextTick();
  initAllSortables();
};

// Рекурсивный поиск элемента по ID и обновление его состояния
const findAndUpdateParent = (
  items: DtoDocLightWithChildren[],
  parentId: string,
): boolean => {
  for (const item of items) {
    if (item.id === parentId) {
      const hasRealChildren = !!item.children && item.children.length > 0;
      item.has_child_docs = hasRealChildren;

      if (hasRealChildren) {
        item.isExpanded = true;
      } else {
        // Если детей нет - сворачиваем и сбрасываем флаг загрузки
        item.isExpanded = false;
        item.isLoadingChildren = false;
        item.children = [];
      }
      return true;
    }

    if (item.children && item.children.length > 0) {
      if (findAndUpdateParent(item.children, parentId)) {
        return true;
      }
    }
  }
  return false;
};

// Функция синхронизация Vue DOM, повторяет перемещение элемента от Sortable DOM
const syncItemPosition = (
  items: DtoDocLightWithChildren[],
  docId: string,
  newParentId: string | undefined,
  newIndex: number,
) => {
  // Находим элемент
  let movedItem: DtoDocLightWithChildren | null = null;
  const removeRecursive = (list: DtoDocLightWithChildren[]): boolean => {
    const idx = list.findIndex((i) => i.id === docId);
    if (idx !== -1) {
      movedItem = list.splice(idx, 1)[0];
      return true;
    }
    for (const item of list) {
      if (item.children && removeRecursive(item.children)) return true;
    }
    return false;
  };

  removeRecursive(items);
  if (!movedItem) return;

  // Вставляем элемент
  if (!newParentId) {
    // В корень
    items.splice(newIndex, 0, movedItem);
  } else {
    // Внутрь родителя
    const insertRecursive = (list: DtoDocLightWithChildren[]): boolean => {
      for (const item of list) {
        if (item.id === newParentId) {
          if (!item.children) item.children = [];
          // newIndex считается относительно детей родителя
          item.children.splice(
            newIndex,
            0,
            movedItem as DtoDocLightWithChildren,
          );
          return true;
        }
        if (item.children && insertRecursive(item.children)) return true;
      }
      return false;
    };
    insertRecursive(items);
  }
};

// Обработчик перемещения Sortable
const handleSortableEnd = (evt: any) => {
  // Поиск элемента, проверка возможности перемещения
  if (evt.oldIndex === evt.newIndex && evt.from === evt.to) return;
  const movedEl = evt.item as HTMLElement;
  const docId = movedEl.dataset.id;
  if (!docId || !currentWorkspaceSlug.value) {
    evt.preventDefault();
    return;
  }

  // Определяем нового родителя
  let newParentId: string | undefined;
  const parentItem = evt.to.closest('.sortable-item');
  if (parentItem) {
    newParentId = parentItem.dataset.id;
  }

  // Определяем старого родителя
  let oldParentId: string | undefined;
  const oldParentLi = evt.from.parentElement?.closest('.sortable-item');
  if (oldParentLi) {
    oldParentId = oldParentLi.dataset.id;
  }

  // Синхронизация DOM Vue и Sortable
  syncItemPosition(hierarchyRoots.value, docId, newParentId, evt.newIndex);

  // Обновление состояний старого и нового родителей (заменяет точку на > и наоборот)
  if (newParentId) {
    findAndUpdateParent(hierarchyRoots.value, newParentId);
  }
  if (oldParentId) {
    findAndUpdateParent(hierarchyRoots.value, oldParentId);
  }

  // Определяем соседей для вычисления порядка
  const siblings = Array.from(evt.to.children).filter(
    (el): el is HTMLElement =>
      el instanceof HTMLElement &&
      el.classList.contains('sortable-item') &&
      el !== movedEl,
  );
  const newIndex = evt.newIndex ?? 0;
  let prevId: string | undefined;
  let nextId: string | undefined;

  if (newIndex > 0) {
    prevId = siblings[newIndex - 1]?.dataset.id;
  }
  if (newIndex < siblings.length) {
    nextId = siblings[newIndex]?.dataset.id;
  }

  // Сохранение операции
  pendingMoves.value.push({
    docId,
    newParentId,
    prevId,
    nextId,
    oldIndex: evt.oldIndex,
    newIndex: evt.newIndex,
    fromEl: evt.from,
    toEl: evt.to,
  });

  // Обновление дерева sortables для корректности данных + возможность вкладывать элементы в только что перенесенные
  nextTick(() => {
    initAllSortables();
  });
};

// Функции диалогового окна

const clearChanges = async () => {
  pendingMoves.value = [];
  await updateHierarchy();
  isSaving.value = false;
};

const saveChanges = async () => {
  if (pendingMoves.value.length === 0) return;
  isSaving.value = false;

  try {
    // Выполняем перемещения по очереди
    for (const move of pendingMoves.value) {
      await docStore.moveDoc(
        currentWorkspaceSlug.value!,
        move.docId,
        move.newParentId,
        move.prevId,
        move.nextId,
      );
    }
    clearChanges();
  } catch (error) {
    console.error('Ошибка при сохранении иерархии', error);
    clearChanges();
  } finally {
    isSaving.value = false;
  }
};

const onDialogShow = () => {
  docStore.isHierarchyOpened = true;
  clearChanges();
};

const onDialogHide = () => {
  destroyAllSortables();
  docStore.isHierarchyOpened = false;
  pendingMoves.value = [];
  hierarchyRoots.value = [];
};

// Функции Sortable

const destroyAllSortables = () => {
  sortableInstances.forEach((s) => s.destroy());
  sortableInstances = [];
};

const initAllSortables = () => {
  destroyAllSortables();

  const rootEl = rootSortableRef.value;
  if (!rootEl) return;

  const allLists = [
    rootEl,
    ...Array.from(rootEl.querySelectorAll('.sortable')),
  ];

  allLists.forEach((list) => {
    const sortable = new Sortable(list as HTMLElement, {
      group: {
        name: 'sortable',
        put: (
          to: Sortable,
        ) => {
          // Запрет на дроп в свернутый список
          if (to.el.classList.contains('sortable-collapsed')) {
            return false;
          }
          return true;
        },
      },
      draggable: '.sortable-item',
      ghostClass: 'sortable-ghost',
      animation: 150,
      forceFallback: true,
      fallbackOnBody: true,
      fallbackTolerance: 5,
      swapThreshold: 0.65,
      emptyInsertThreshold: 10,
      preventOnFilter: true,
      onEnd: handleSortableEnd,
    });
    sortableInstances.push(sortable);
  });
};

onBeforeUnmount(() => {
  destroyAllSortables();
});

watch(
  () => pendingMoves.value.length,
  (newWalue) => {
    if (newWalue > 0) {
      isSaving.value = true;
    }
  },
);
</script>

<style lang="scss" scoped>
.visible-scroll {
  scrollbar-width: auto !important;
  scrollbar-color: auto !important;
}

.visible-scroll::-webkit-scrollbar {
  display: block !important;
}

.doc-hierarchy-card {
  border-radius: 16px;
  padding: 8px;
}

.nested {
  user-select: none;

  &:active {
    cursor: grabbing;
  }
}

.sortable {
  margin-bottom: 0;
  padding: 0;
  list-style-type: none;
  max-height: 50vh;
  max-width: 70vh;
  width: 100%;
  overflow-y: auto;
  overflow-x: hidden;
}

:deep(.sortable-ghost) {
  opacity: 0.5;
  border-top: 2px solid var(--primary);
}

.sortable-end {
  margin-top: 24px;
  height: 1px;
  list-style-type: none;
  opacity: 0;
  pointer-events: none;
  visibility: hidden;
}

:deep(.sortable-chosen) {
  z-index: 9999 !important;
}
</style>
