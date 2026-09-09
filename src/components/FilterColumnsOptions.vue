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
          <span class="ellipsis">{{ optionLabel(scope.opt) }}</span>
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

// имя доп. параметра задаёт админ без ограничений — в списке режем, полное в тултипе
const MAX_OPTION_LABEL = 100;
function optionLabel(opt: { name?: string; label?: string }): string {
  const label = opt.label ?? '';
  if (!isPropertyColumn(opt.name) || label.length <= MAX_OPTION_LABEL)
    return label;
  return `${label.slice(0, MAX_OPTION_LABEL)}…`;
}

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
  // до max-content самого длинного пункта. Инлайновый maxWidth ставить нельзя:
  // Quasar на каждом updatePosition (показ/скролл/ресайз) перетирает el.style.maxWidth
  // своим значением — поэтому ширина едет через CSS-переменную + !important (стиль ниже).
  const fieldWidth = (selectRef.value?.$el as HTMLElement | undefined)
    ?.offsetWidth;
  if (fieldWidth)
    menu.style.setProperty('--columns-menu-width', `${fieldWidth}px`);

  const list = menu.querySelector(
    '.q-virtual-scroll__content',
  ) as HTMLElement | null;
  if (!list) return;

  sortableContainer.value = list;
  await initSortable();
}
</script>

<style lang="scss">
/* попап телепортирован в body — scoped-стиль его не достанет */
.columns-dnd-menu {
  max-width: var(--columns-menu-width, 100%) !important;
}
</style>

<style scoped lang="scss">
.drag-handle {
  cursor: grab;
}

.column-option__label {
  min-width: 0;

  // span — flex-элемент внутри flex-колонки секции: Chrome отдаёт ему ширину по
  // max-content nowrap-текста (834px при секции 160px), эллипсис не срабатывает.
  // max-width: 100% — тот же приём, что у квазаровской .q-item__section--main.
  // Проверено живым замером на стенде (scrollWidth == width на всей цепочке).
  > span {
    max-width: 100%;
    min-width: 0;
  }
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
