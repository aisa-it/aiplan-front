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
            class="nested"
          />
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
}

const workspaceStore = useWorkspaceStore();
const docStore = useAiDocStore();
const { currentWorkspaceSlug } = storeToRefs(workspaceStore);

const hierarchyRoots = ref<DtoDocLightWithChildren[]>([]);

const buildHierarchy = async (
  docs: DtoDocLight[],
): Promise<DtoDocLightWithChildren[]> => {
  const result: DtoDocLightWithChildren[] = [];
  for (const doc of docs) {
    const item: DtoDocLightWithChildren = { ...doc };
    if (doc.has_child_docs && doc.id) {
      const childResponse = await docStore.getChildDocList(
        currentWorkspaceSlug.value!,
        doc.id,
      );
      const children = await buildHierarchy(childResponse.data);
      item.children = children;
    }
    result.push(item);
  }
  return result;
};

const loadHierarchy = async () => {
  if (!currentWorkspaceSlug.value) return;

  await docStore.getRootDocs(currentWorkspaceSlug.value);
  hierarchyRoots.value = await buildHierarchy(docStore.rootDocs);
};

const updateHierarchy = async () => {
  await loadHierarchy();
  await nextTick();
  initAllSortables();
};

const rootSortableRef = ref<HTMLElement | null>(null);

// Обработчик перемещения
const handleSortableEnd = async (evt: any) => {
  if (evt.oldIndex === evt.newIndex && evt.from === evt.to) return;

  // Элемент
  const movedEl = evt.item as HTMLElement;
  const docId = movedEl.dataset.id;
  if (!docId || !currentWorkspaceSlug.value) return;

  // Родитель
  let parentId: string | undefined;
  const parentItem = evt.to.closest('.sortable-item');
  if (parentItem) {
    parentId = parentItem.dataset.id;
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

  // Отправка
  try {
    await docStore.moveDoc(
      currentWorkspaceSlug.value,
      docId,
      parentId,
      prevId,
      nextId,
    );
    await updateHierarchy();
  } catch (error) {
    console.error('Failed to move document', error);
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
      preventOnFilter: true,
      onEnd: handleSortableEnd,
    });
    sortableInstances.push(sortable);
  });
};

const onDialogShow = async () => {
  await updateHierarchy();
};

const onDialogHide = () => {
  destroyAllSortables();
  docStore.isHierarchyOpened = false;
};
</script>

<style lang="scss" scoped>
.nested {
  cursor: grab;
  user-select: none;

  &:active {
    cursor: grabbing;
  }
}
</style>
