<template>
  <q-dialog class="doc-hierarchy-dialog" @hide="onHideDialog">
    <q-card class="inner-modal-card">
      <q-card-section class="column q-pt-none">
        <h6 class="q-ml-md">Иерархия документов</h6>
        <div class="tree-wrapper">
          <div
            v-if="isMobile"
            class="tree-drop-dragged-item"
            :class="{ hidden: !currentTouchLocation }"
          >
            {{ currentItem?.title }}
          </div>
          <q-tree
            id="tree"
            ref="treeRef"
            :nodes="treeNode"
            node-key="id"
            label-key="title"
            :expanded="expandedNodes"
            @update:expanded="(nodes) => (expandedNodes = [...nodes])"
            @lazy-load="lazyLoad"
          >
            <template v-slot:default-header="prop">
              <div
                :id="prop.node.id"
                class="tree-drop-helper tree-drop-helper-top"
                :class="{
                  'tree-drop-helper--active': isHelperActive(
                    prop.node.id,
                    'tree-drop-helper-top',
                  ),
                }"
                @dragover="handleDragOver($event)"
                @dragenter="onDragEnter($event)"
                @dragleave="onDragLeave($event)"
                @drop="handleDrop($event)"
                @touchend="handleDrop($event)"
              ></div>
              <div
                :id="prop.node.id"
                class="tree-custom-header"
                :draggable="isDraggable ? true : false"
                @mousedown="startDragging($event)"
                @dragstart="handleDragStart($event)"
                @dragover="handleDragOver($event)"
                @drop="handleDrop($event)"
                @dragend="handleDragEnd($event)"
                @touchmove="handleTouchMove($event)"
                @touchend="handleDrop($event)"
                @touchcancel="handleTouchCancel()"
              >
                {{ prop.node.title }}
              </div>
              <HintTooltip max-width="300px">{{ prop.node.title }}</HintTooltip>
              <div
                v-if="prop.node.isLastItem"
                :id="prop.node.id"
                class="tree-drop-helper tree-drop-helper-bottom"
                :class="{
                  'tree-drop-helper--active': isHelperActive(
                    prop.node.id,
                    'tree-drop-helper-bottom',
                  ),
                }"
                @dragover="handleDragOver($event)"
                @dragenter="onDragEnter($event)"
                @dragleave="onDragLeave($event)"
                @drop="handleDrop($event)"
                @touchend="handleDrop($event)"
              ></div>
            </template>
          </q-tree>
        </div>
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
import { ref, watch, onMounted, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useWorkspaceStore } from 'src/stores/workspace-store';
import { useNotificationStore } from 'stores/notification-store';
import { useAiDocStore } from 'src/stores/aidoc-store';
import { QTree, useQuasar } from 'quasar';
import { IDocTreeNode } from 'src/interfaces/docs';
import { mapDocNode } from 'src/utils/tree';

interface IDocTreeNodeSort extends IDocTreeNode {
  isLastItem?: boolean;
  children?: [];
}

// stores
const workspaceStore = useWorkspaceStore();
const docStore = useAiDocStore();
const { setNotificationView } = useNotificationStore();
// store to refs
const { currentWorkspaceSlug } = storeToRefs(workspaceStore);
const { rootDocs } = storeToRefs(docStore);

const $q = useQuasar();
const treeRef = ref<QTree | null>();
const treeNode = ref<IDocTreeNodeSort[]>([]);
const isDraggable = ref(false);
const currentItemId = ref('');
const currentItem = ref();
const currentTouchLocation = ref();
const currentTarget = ref();
const expandedNodes = ref<string[]>([]);
const nodesToExpand = ref<string[]>([]);

const isMobile = computed(() => $q.platform.is.mobile);

const handleTouchMove = (event: any) => {
  event.preventDefault();
  currentTouchLocation.value = event.targetTouches[0];
  currentItemId.value = event?.target?.id;
  currentItem.value = treeRef.value?.getNodeByKey(currentItemId.value);
  currentTarget.value = document.elementFromPoint(
    currentTouchLocation.value?.pageX,
    currentTouchLocation.value?.pageY,
  );
  const docTitle = document.querySelector('.tree-drop-dragged-item');
  docTitle.style.left = currentTouchLocation.value.pageX + 'px';
  docTitle.style.top = currentTouchLocation.value.pageY + 'px';
};

const handleTouchCancel = () => {
  resetData();
};

const startDragging = (event: MouseEvent) => {
  if (!event?.target?.id) return;
  currentItemId.value = event?.target?.id;
  currentItem.value = treeRef.value?.getNodeByKey(currentItemId.value);
  isDraggable.value = true;
};

const handleDragStart = (event: any) => {
  event.dataTransfer.effectAllowed = 'move';
  event.dataTransfer.setData('text/plain', '');
  event.currentTarget.classList.add('dragging-state');
};

const handleDragOver = (event: DragEvent) => {
  event.preventDefault();
  if (currentItemId.value !== event?.target?.id)
    event.dataTransfer!.dropEffect = 'move';
};

const onDragEnter = (event: DragEvent) => {
  event?.target?.classList.add('tree-drop-helper--active');
};

const onDragLeave = (event: DragEvent) => {
  event?.target?.classList.remove('tree-drop-helper--active');
};

const isTargetChild = (folder: any, target: string) => {
  if (folder?.children) {
    for (let child of folder.children) {
      if (child.id === target) {
        return child;
      }
      const res = isTargetChild(child, target);
      if (res) return res;
    }
  }
};

const moveDoc = async (event: any) => {
  let reqParentId: string | null = null;
  let reqPrevId: string | null = null;
  let reqNextId: string | null = null;

  const targetEl = isMobile.value ? currentTarget.value : event?.target;
  targetEl?.classList.remove('tree-drop-helper--active');

  const targetId = targetEl?.id;
  if (!targetId) {
    resetData();
    return;
  }
  const parentId = treeRef.value?.getNodeByKey(targetId)?.parentId;
  let targetFolder = [];

  const isChild = isTargetChild(currentItem.value, targetId);
  if (isChild) {
    setNotificationView({
      open: true,
      type: 'error',
      customMessage: 'Невозможно переместить документ в его же дочерний',
    });
    resetData();
    return;
  }

  if (parentId) {
    targetFolder = treeRef.value?.getNodeByKey(parentId).children;
  } else {
    targetFolder = rootDocs.value;
  }
  const targetIndex = targetFolder.findIndex((doc) => doc.id === targetId);
  const currentIndex = targetFolder.findIndex(
    (doc) => doc.id === currentItemId.value,
  );

  if (
    currentItemId.value === targetId ||
    (currentIndex !== -1 &&
      targetIndex === currentIndex + 1 &&
      targetEl?.classList.contains('tree-drop-helper-top'))
  ) {
    resetData();
    return;
  }

  if (targetEl?.classList.contains('tree-drop-helper')) {
    if (parentId) {
      reqParentId = parentId;
    }

    if (targetIndex === 0) {
      reqNextId = targetId;
    } else if (targetIndex === targetFolder.length - 1) {
      reqPrevId = targetFolder[targetIndex - 1].id;
      if (!targetEl?.classList.contains('tree-drop-helper-bottom')) {
        reqNextId = targetId;
      }
    } else {
      reqPrevId = targetFolder[targetIndex - 1].id;
      reqNextId = targetId;
    }

    if (targetIndex !== 0 && targetIndex !== targetFolder.length - 1) {
      reqPrevId = targetFolder[targetIndex - 1].id;
      reqNextId = targetId;
    } else if (targetIndex === 0) {
      reqNextId = targetId;
    } else if (targetIndex === targetFolder.length - 1) {
      if (targetEl?.classList.contains('tree-drop-helper-bottom')) {
        reqPrevId = targetFolder[targetIndex].id;
      } else {
        reqPrevId = targetFolder[targetIndex - 1].id;
      }
    }
  } else if (targetEl?.classList.contains('tree-custom-header')) {
    reqParentId = targetId;
    if (currentItemId.value === reqParentId) return;
  }

  await docStore.moveDoc(
    currentWorkspaceSlug.value,
    currentItemId.value,
    reqParentId,
    reqPrevId,
    reqNextId,
  );
  resetData();
  nodesToExpand.value = [...expandedNodes.value];
  await getRootDocs();
  for (const id of nodesToExpand.value) {
    const node = treeRef.value?.getNodeByKey(id);
    if (node) treeRef.value?.setExpanded(id, true);
  }
};

const handleDrop = async (event: any) => {
  event?.target?.classList.remove('tree-drop-helper--active');
  try {
    moveDoc(event);
  } catch {
  } finally {
    resetData();
  }
};

const handleDragEnd = async (event: any) => {
  event?.currentTarget?.classList.remove('dragging-state');
};

const getRootDocs = async () => {
  if (currentWorkspaceSlug?.value) {
    await docStore.getRootDocs(currentWorkspaceSlug.value);
  }
};

const lazyLoad = async ({
  key,
  done,
}: {
  key: string;
  done: (children?: readonly any[]) => void;
}) => {
  if (!currentWorkspaceSlug || !currentWorkspaceSlug.value) return;
  const children = (
    await docStore.getChildDocList(currentWorkspaceSlug.value, key)
  ).data;
  done(
    children.map(mapDocNode).map((doc, index) => {
      return {
        ...doc,
        parentId: key,
        isLastItem: children.length - 1 === index,
      };
    }),
  );
  for (const el of children) {
    if (el.has_child_docs && el.id && nodesToExpand.value.includes(el.id)) {
      const node = treeRef.value?.getNodeByKey(el.id);
      if (node) treeRef.value?.setExpanded(el.id, true);
    }
  }
};

const onHideDialog = () => {
  expandedNodes.value = [];
  nodesToExpand.value = [];
  docStore.isHierarchyOpened = false;
};

const isHelperActive = (helperId: string, helperClass: string) => {
  return (
    isMobile.value &&
    helperId === currentTarget.value?.id &&
    currentTarget.value?.classList.contains(helperClass)
  );
};

const resetData = () => {
  isDraggable.value = false;
  currentItem.value = null;
  currentItemId.value = '';
  currentTouchLocation.value = null;
  currentTarget.value = null;
};

watch(
  () => rootDocs.value,
  (newVal) => {
    if (newVal.length) {
      treeNode.value = newVal.map(mapDocNode);
      treeNode.value[treeNode.value.length - 1].isLastItem = true;
    }
  },
  { deep: true },
);

onMounted(async () => {
  await getRootDocs();
});
</script>

<style lang="scss">
.doc-hierarchy-dialog {
  .tree-wrapper {
    width: 100%;
    max-width: 600px;
  }
  .q-tree__node {
    overflow: hidden;
    padding-bottom: 0;
  }
  .q-tree__node--parent {
    padding-bottom: 4px;
    &
      > .q-tree__node-header
      > .q-tree__node-header-content
      .tree-drop-helper-bottom {
      z-index: 2;
      left: 0;
    }
  }
  .q-tree__node--child {
    margin-bottom: 6px;
  }
  .q-focus-helper {
    display: none;
  }
  .q-tree__node-header {
    position: static !important;
  }
  .tree-drop-helper {
    display: flex;
    align-items: center;
    position: absolute;
    left: -30px;
    width: 130%;
    height: 14px;
    &:before {
      content: '';
      display: block;
      width: 100%;
      height: 2px;
      background-color: $border-color;
      opacity: 0;
      visibility: hidden;
    }
  }
  .tree-drop-helper-top {
    top: -6px;
  }
  .tree-drop-helper-bottom {
    bottom: -6px;
  }
  .tree-drop-helper--active {
    &:before {
      opacity: 1;
      visibility: visible;
    }
  }
  .tree-custom-header {
    max-width: 250px;
    color: $text-color;
    background-color: transparent !important;
  }
  .tree-drop-dragged-item {
    position: fixed;
    max-width: 250px;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    transform: translate(-50%, -50%);
    opacity: 0.5;
  }
  @media screen and (min-width: 768px) {
    .q-tree__node-header:hover {
      background-color: $hover-color;
    }
    .tree-custom-header {
      max-width: 550px;
    }
  }
}
</style>
