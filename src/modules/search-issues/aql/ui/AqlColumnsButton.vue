<template>
  <q-btn-dropdown
    flat
    no-caps
    class="btn-sm aql-columns-btn"
    dropdown-icon="expand_more"
    content-class="aql-columns-menu"
    menu-anchor="bottom right"
    menu-self="top right"
    @show="onShow"
  >
    <template #label>
      <Filterv2Icon :width="18" :height="18" />
      <span>Столбцы</span>
    </template>

    <q-list ref="listRef">
      <q-item
        v-for="column in options"
        :key="column.name"
        :data-id="column.name"
        clickable
        class="aql-columns-menu__item"
        @click="toggle(column.name)"
      >
        <q-item-section side>
          <q-checkbox
            dense
            :model-value="columnsToShow.includes(column.name)"
            @update:model-value="toggle(column.name)"
          />
        </q-item-section>
        <q-item-section>{{ column.label }}</q-item-section>
        <q-item-section side>
          <q-icon name="drag_indicator" class="aql-columns-menu__handle" />
        </q-item-section>
      </q-item>
    </q-list>
  </q-btn-dropdown>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { QList } from 'quasar';

import { useSortable } from 'src/composables/useSortable';

import Filterv2Icon from 'src/components/icons/Filterv2Icon.vue';

// столбец с номером задачи не скрывается и не двигается
const FIXED_COLUMN = 'sequence_id';

const props = defineProps<{
  columns: any[];
  columnsToShow: string[];
}>();

const emits = defineEmits<{
  'update:columnsToShow': [value: string[]];
}>();

const listRef = ref<QList | null>(null);
const sortableContainer = ref<HTMLElement | null>(null);

const options = computed(() =>
  props.columns.filter((column) => column.name !== FIXED_COLUMN),
);

const toggle = (name: string) => {
  const shown = props.columnsToShow.includes(name);
  emits(
    'update:columnsToShow',
    shown
      ? props.columnsToShow.filter((el) => el !== name)
      : [...props.columnsToShow, name],
  );
};

const { initSortable } = useSortable(sortableContainer, {
  draggable: '.aql-columns-menu__item',
  handle: '.aql-columns-menu__handle',
  // порядок берём из DOM по data-id, а перенос откатываем: списком владеет Vue
  onEnd: ({ evt }) => {
    const { from, item, oldIndex } = evt;
    const order = Array.from(
      from.querySelectorAll<HTMLElement>('.aql-columns-menu__item'),
      (el) => el.dataset.id ?? '',
    );

    from.removeChild(item);
    from.insertBefore(item, from.children[oldIndex ?? 0] ?? null);

    const shown = props.columnsToShow;
    emits('update:columnsToShow', [
      ...shown.filter((name) => name === FIXED_COLUMN),
      ...order.filter((name) => shown.includes(name)),
    ]);
  },
});

const onShow = () => {
  sortableContainer.value = listRef.value?.$el ?? null;
  initSortable();
};
</script>

<style lang="scss">
/* меню телепортировано в body — scoped-стиль его не достанет */
.aql-columns-menu {
  // ширину самого меню Quasar задаёт в style по ширине кнопки
  .q-list {
    min-width: 300px;
  }

  &__item {
    min-height: 40px;
  }

  &__handle {
    cursor: grab;
  }
}
</style>
