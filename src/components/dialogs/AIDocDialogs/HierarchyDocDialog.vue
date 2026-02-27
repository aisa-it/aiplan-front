<template>
  <q-dialog
    class="doc-hierarchy-dialog"
    @show="onDialogShow"
    @hide="onDialogHide"
  >
    <q-card class="inner-modal-card">
      <q-card-section class="column q-pt-none">
        <h6 class="q-ml-md">Иерархия документов</h6>
        <ul class="sortable" ref="rootSortableRef">
          <HierarchyDocDialogItem
            v-for="item in hierarchyRoots"
            :key="item.id"
            :item="item"
            :on-sortable-end="handleSortableEnd"
            :on-expand-request="handleExpandRequest"
            :expand-trigger="parentToExpandId"
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
          label="Закрыть"
          class="btn secondary-btn"
          v-close-popup
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts" setup>
import { ref, nextTick } from 'vue';
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

const workspaceStore = useWorkspaceStore();
const docStore = useAiDocStore();
const { currentWorkspaceSlug } = storeToRefs(workspaceStore);

const hierarchyRoots = ref<DtoDocLightWithChildren[]>([]);
const parentToExpandId = ref<string | null>(null);

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

// Функция обработчик для раскрытия элемента
const handleExpandRequest = async (itemId: string) => {
  // Хэлпер для рекурсивного поиска элемента в дереве
  const findAndLoad = async (
    items: DtoDocLightWithChildren[],
  ): Promise<void> => {
    for (const item of items) {
      if (item.id === itemId) {
        if (item.children && item.children.length > 0) {
          item.isExpanded = true;
          return;
        }

        item.isLoadingChildren = true;

        try {
          const childResponse = await docStore.getChildDocList(
            currentWorkspaceSlug.value as string,
            item.id,
          );

          // Сохранение потомков вместе с флагами
          item.children = childResponse.data.map((child) => ({
            ...child,
            children: [],
            isExpanded: false,
            isLoadingChildren: false,
          }));

          item.isExpanded = true;
        } catch (e) {
          console.error('Ошибка при загрузке вложенных документов', e);
        } finally {
          item.isLoadingChildren = false;
        }
        return;
      }

      // Рекурсивный поиск в детях, если они есть
      if (item.children && item.children.length > 0) {
        await findAndLoad(item.children);
      }
    }
  };

  await findAndLoad(hierarchyRoots.value);
};

const rootSortableRef = ref<HTMLElement | null>(null);

// Обработчик перемещения
const handleSortableEnd = async (evt: any) => {
  // Сброс перемещения для устранения рассинхрона с Vue DOM
  evt.from.insertBefore(
    evt.item,
    evt.oldDraggableIndex !== undefined
      ? evt.from.children[evt.oldDraggableIndex]
      : null,
  );

  if (evt.oldIndex === evt.newIndex && evt.from === evt.to) return;

  // Элемент
  const movedEl = evt.item as HTMLElement;
  const docId = movedEl.dataset.id;
  if (!docId || !currentWorkspaceSlug.value) return;

  // Новый родитель
  let newParentId: string | undefined;
  const parentItem = evt.to.closest('.sortable-item');
  if (parentItem) {
    newParentId = parentItem.dataset.id;
  }

  // Старый родитель
  let oldParentId: string | undefined;
  const oldParentItem = evt.from.closest('.sortable-item');
  if (oldParentItem) {
    oldParentId = oldParentItem.dataset.id;
  }

  // Соседние элементы
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

  destroyAllSortables();

  try {
    await docStore.moveDoc(
      currentWorkspaceSlug.value,
      docId,
      newParentId,
      prevId,
      nextId,
    );
    await updateHierarchy();

    // Выбор элемента для раскрытия списка
    let idToExpand: string | null = null;

    if (newParentId) {
      idToExpand = newParentId;
    } else if (oldParentId) {
      idToExpand = oldParentId;
    }

    if (idToExpand) {
      parentToExpandId.value = idToExpand;
      await nextTick();
      parentToExpandId.value = null;
    }
  } catch (error) {
    console.error('Ошибка при перемещении документа', error);
    await updateHierarchy();
  }
};

// Создание и чистка экземпляров сортировки. При каждом перемещении элемента дерево DOM перестраивается
let sortableInstances: Sortable[] = [];

const destroyAllSortables = () => {
  sortableInstances.forEach((s) => s.destroy());
  sortableInstances = [];
};

const initAllSortables = () => {
  destroyAllSortables();

  const rootEl = rootSortableRef.value;
  if (!rootEl || !handleSortableEnd) return;

  const allLists = [
    rootEl,
    ...Array.from(rootEl.querySelectorAll('.sortable')),
  ];

  allLists.forEach((list) => {
    const sortable = new Sortable(list as HTMLElement, {
      group: 'sortable',
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

const onDialogShow = async () => {
  docStore.isHierarchyOpened = true;
  await updateHierarchy();
};

const onDialogHide = () => {
  destroyAllSortables();
  docStore.isHierarchyOpened = false;
};
</script>

<style lang="scss" scoped>
.nested {
  user-select: none;

  &:active {
    cursor: grabbing;
  }
}

.sortable {
  margin-bottom: 0;
  padding: 0 0 0 16px;
  list-style-type: none;
}

:deep(.sortable-ghost) {
  opacity: 0.5;
  border-top: 2px solid var(--primary);
}

.sortable-end {
  height: 12px;
  list-style-type: none;
  opacity: 0;
}
</style>
