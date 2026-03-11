<template>
  <li class="sortable-item" :data-id="item.id" @click.stop="toggleExpand">
    <div class="item-row">
      <div v-if="hasChildren" class="toggle-btn">
        <q-icon
          :name="'chevron_right'"
          :class="['toggle-icon', { 'toggle-icon_rotated': isExpanded }]"
          size="sm"
        />
      </div>
      <div v-else class="spacer"></div>
      <p class="ellipsis item-title">{{ item.title }}</p>
      <HintTooltip> {{ item.title }}</HintTooltip>
    </div>

    <ul
      :style="{ maxHeight: `${adaptiveMaxHeight}px` }"
      :class="[
        'sortable nested',
        { 'sortable-collapsed': hasChildren && !isExpanded },
      ]"
    >
      <HierarchyDocDialogItem
        v-for="child in item.children"
        :key="child.id"
        :item="child"
        :on-sortable-end="onSortableEnd"
        @sortable-refresh="emit('sortable-refresh')"
      />
    </ul>
  </li>
</template>

<script lang="ts" setup>
import { computed, nextTick, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useWorkspaceStore } from 'src/stores/workspace-store';
import { useAiDocStore } from 'src/stores/aidoc-store';
import HintTooltip from '../HintTooltip.vue';
import type { DtoDocLightWithChildren } from './AIDocDialogs/HierarchyDocDialog.vue';

const props = defineProps<{
  item: DtoDocLightWithChildren;
  onSortableEnd?: (evt: any) => void;
}>();

const emit = defineEmits<{
  (e: 'sortable-refresh'): void;
}>();

const workspaceStore = useWorkspaceStore();
const docStore = useAiDocStore();
const { currentWorkspaceSlug } = storeToRefs(workspaceStore);

const isExpanded = ref<boolean>(false);

const hasChildren = computed<boolean | undefined>(() => {
  return !!props.item.has_child_docs;
});

const adaptiveMaxHeight = computed<number>(() => {
  if (!isExpanded.value) {
    return hasChildren.value ? 0 : 33;
  } else {
    return 9000;
  }
});

// Догрузка вложенных документов
const loadChildren = async (itemId: string) => {
  if (props.item.children && props.item.children.length > 0) return;

  props.item.isLoadingChildren = true;
  try {
    const childResponse = await docStore.getChildDocList(
      currentWorkspaceSlug.value as string,
      itemId,
    );
    props.item.children = childResponse.data.map((child) => ({
      ...child,
      children: [],
      isExpanded: false,
      isLoadingChildren: false,
    }));
  } catch (e) {
    console.error('Ошибка при загрузке вложенных документов', e);
  } finally {
    props.item.isLoadingChildren = false;
  }
};

// Разворот вложенных документов
const toggleExpand = async () => {
  if (props.item.children && props.item.children.length > 0) {
    isExpanded.value = !isExpanded.value;
    // Синхронизирация флага в объекте данных, чтобы родительское дерево знало о состоянии
    props.item.isExpanded = isExpanded.value;
    return;
  }

  if (props.item.has_child_docs) {
    await loadChildren(props.item.id as string);
    await nextTick();
    isExpanded.value = true;
    props.item.isExpanded = true;
    emit('sortable-refresh');
  }
};

// Синхронизация состояния раскрытия
watch(
  () => props.item.isExpanded,
  (newVal) => {
    if (newVal !== undefined && newVal !== isExpanded.value) {
      isExpanded.value = newVal;
    }
  },
  { immediate: true },
);
</script>

<style scoped lang="scss">
.sortable {
  &-item {
    list-style-type: none;
  }
}

.item-title {
  padding: 2px 8px 2px 16px;
  margin-bottom: 8px;
}

.item-row {
  display: flex;
  user-select: none;

  &:hover,
  &:active {
    background-color: $hover-color;
  }
}

.nested {
  list-style-type: none;
  user-select: none;
  overflow: hidden;

  &:active {
    cursor: grabbing;
  }
}

:deep(.sortable-ghost) {
  opacity: 0.5;
  border-top: 2px solid var(--primary);
}

.toggle-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  min-width: 24px;
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 0;
  color: inherit;
  opacity: 0.6;
  transition:
    opacity 0.2s,
    background-color 0.2s;
  border-radius: 4px;

  &:hover {
    opacity: 1;
  }
}

.toggle-icon {
  transition: transform 0.2s ease-in-out;

  &_rotated {
    transform: rotate(90deg);
  }
}

.spacer {
  width: 24px;
  min-width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  &::after {
    content: '';
    display: block;
    width: 6px;
    height: 6px;
    background-color: currentColor;
    border-radius: 50%;
    opacity: 0.5;
  }
}
</style>
