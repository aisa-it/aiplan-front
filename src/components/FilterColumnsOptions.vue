<template>
  <q-select
    ref="selectRef"
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

        <!-- имя доп. параметра задаёт админ и оно бывает длинным — режем с тултипом -->
        <q-item-section class="column-option__label">
          <span class="ellipsis">{{ scope.opt.label }}</span>
          <q-tooltip
            v-if="isPropertyColumn(scope.opt.name)"
            anchor="bottom middle"
            self="top middle"
            >{{ scope.opt.label }}</q-tooltip
          >
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
import { QSelect } from 'quasar';
import { useSortable } from 'src/composables/useSortable';
import { isPropertyColumn } from 'src/modules/issue-list/constants/tableColumns';

const props = defineProps<{
  columns: any[];
  columnsToShow: string[];
}>();

const emits = defineEmits<{
  'update:columnsToShow': [string[]];
}>();
const sortableContainer = ref<HTMLElement | null>(null);
const selectRef = ref<QSelect | null>(null);

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

  // q-menu с fit задаёт попапу только min-width по ширине поля, а вверх растёт
  // до max-content самого длинного пункта — зажимаем шириной поля
  const fieldWidth = (selectRef.value?.$el as HTMLElement | undefined)
    ?.offsetWidth;
  if (fieldWidth) menu.style.maxWidth = `${fieldWidth}px`;

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

.column-option__label {
  min-width: 0;
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
