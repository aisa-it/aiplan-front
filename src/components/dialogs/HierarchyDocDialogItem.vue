<template>
  <li class="sortable-item" :data-id="item.id">
    <div class="item-row">
      <button
        v-if="hasChildren"
        class="toggle-btn"
        type="button"
        @click.stop="toggleExpand"
      >
        <q-icon
          :name="'chevron_right'"
          :class="['toggle-icon', { 'toggle-icon_rotated': isExpanded }]"
          size="sm"
        />
      </button>

      <div v-else class="spacer"></div>

      <p class="ellipsis item-title">{{ item.title }}</p>
    </div>
    <q-slide-transition>
      <ul v-if="isExpanded" :class="['sortable', 'nested']">
        <HierarchyDocDialogItem
          v-for="child in item.children"
          :key="child.id"
          :item="child"
          :on-sortable-end="onSortableEnd"
        />
      </ul>
    </q-slide-transition>
  </li>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import type { DtoDocLightWithChildren } from './AIDocDialogs/HierarchyDocDialog.vue';

const props = defineProps<{
  item: DtoDocLightWithChildren;
  onSortableEnd?: (evt: any) => Promise<void>;
}>();

const isExpanded = ref<boolean>(true);

const hasChildren = computed<boolean | undefined>(() => {
  return props.item.children && props.item.children.length > 0;
});

const toggleExpand = (): void => {
  isExpanded.value = !isExpanded.value;
};
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
