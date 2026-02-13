<template>
  <li class="sortable-item" :data-id="item.id">
    <p>{{ item.title }}</p>
    <ul
      :class="[
        'sortable',
        'nested',
        { 'nested__empty': !item.children?.length },
      ]"
    >
      <HierarchyDocDialogItem
        v-for="child in item.children"
        :key="child.id"
        :item="child"
        :on-sortable-end="onSortableEnd"
      />
    </ul>
  </li>
</template>

<script lang="ts" setup>
import type { DtoDocLightWithChildren } from './AIDocDialogs/HierarchyDocDialog.vue';

const props = defineProps<{
  item: DtoDocLightWithChildren;
  onSortableEnd?: (evt: any) => Promise<void>;
}>();
</script>

<style scoped lang="scss">
.nested {
  cursor: grab;
  user-select: none;

  &:active {
    cursor: grabbing;
  }
}
</style>
