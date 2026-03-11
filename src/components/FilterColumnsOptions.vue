<template>
  <q-select
    :model-value="columnsToShow"
    dense
    label="Колонки"
    class="base-selector full-w"
    multiple
    map-options
    :options="columns"
    :option-label="(col) => col.label"
    :option-value="(col) => col.name"
    popup-content-class="columns-dnd-menu"
    @popup-show="onPopupShow"
  >
    <template #option="scope">
      <q-item
        v-if="scope.opt.name !== 'sequence_id'"
        :key="scope.opt.name"
        v-bind="scope.itemProps"
        :data-id="scope.opt.name"
        class="selector-option__wrapper draggable-item"
      >
        <q-item-section side>
          <q-checkbox
            :model-value="scope.selected"
            @update:model-value="(val) => onToggle(scope.opt.name, val)"
          />
        </q-item-section>

        <q-item-section>
          {{ scope.opt.label }}
        </q-item-section>

        <q-item-section side>
          <q-icon name="drag_indicator" class="drag-handle" />
        </q-item-section>
      </q-item>
    </template>
  </q-select>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue';
import { useSortable } from 'src/composables/useSortable';

const props = defineProps<{
  columns: any[];
  columnsToShow: string[];
}>();

const emits = defineEmits<{
  'update:columnsToShow': [string[]];
}>();
const sortableContainer = ref<HTMLElement | null>(null);

function onToggle(name: string, checked: boolean) {
  const set = new Set(props.columnsToShow);
  checked ? set.add(name) : set.delete(name);
  emits('update:columnsToShow', [...set]);
}

const { initSortable } = useSortable(sortableContainer, {
  draggable: '.draggable-item',
  handle: '.drag-handle',
  ghostClass: 'sortable-ghost',
  chosenClass: 'sortable-chosen',
  animation: 150,
  onEnd: ({ oldIndex, newIndex }) => {
    if (oldIndex == null || newIndex == null) return;
    if (oldIndex === newIndex) return;

    const newOrder = [...props.columns];

    newOrder.splice(newIndex + 1, 0, newOrder.splice(oldIndex + 1, 1)[0]);

    emits(
      'update:columnsToShow',
      newOrder
        .map((el) => el.name)
        .filter((el) => props.columnsToShow.includes(el)),
    );
  },
});

async function onPopupShow() {
  await nextTick();

  const menu = document.querySelector(
    '.columns-dnd-menu',
  ) as HTMLElement | null;

  if (!menu) return;

  const list = menu.querySelector(
    '.q-virtual-scroll__content',
  ) as HTMLElement | null;
  if (!list) return;

  sortableContainer.value = list;
  await initSortable();
}
</script>

<style scoped lang="scss">
.drag-handle {
  cursor: grab;
}

.selector-option-columns__wrapper {
  transition: transform 150ms ease;
}

.selector-option {
  &__wrapper {
    min-height: 40px;
  }

  &-columns__wrapper {
    padding-left: 12px;

    .q-item__section--side {
      padding-right: 12px;
    }
  }
}
</style>
