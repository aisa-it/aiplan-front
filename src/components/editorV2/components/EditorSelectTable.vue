<template>
  <q-btn-dropdown
    v-model="isOpenSelect"
    dense
    flat
    :disable="isDisabled"
    :content-class="`table-select ${classPrevent}`"
    :menu-self="'top left'"
    :menu-anchor="'bottom end'"
    :menu-offset="[-25, 4]"
    @hide="tableInsertValue = null"
  >
    <template #label>
      <component :is="ICONS.tableInsertIcon" />
      <HintTooltip>Вставить таблицу</HintTooltip>
    </template>

    <div>
      <h6 class="table-select__title">
        {{ textTitle }}
      </h6>
      <div v-if="!isOpenFields && !isMobile">
        <ul class="table-select__list">
          <li
            v-for="row in tableInstance[0]"
            :key="'row-' + row"
            class="table-select__row"
          >
            <ul class="table-select__cols">
              <li
                v-for="col in tableInstance[1]"
                :key="'col-' + col"
                class="table-select__cell"
                :class="getCellClass(row, col)"
                @click="handleInsertTable({ rows: row, cols: col })"
                @mousemove="handleMoseMove(row, col)"
                @mouseleave="tableInsertValue = null"
              />
            </ul>
          </li>
        </ul>

        <q-btn
          dense
          flat
          no-caps
          class="table-select__btn"
          :class="classPrevent"
          @click="isOpenFields = true"
        >
          <component :is="ICONS.tableIcon" />
          <span class="inline-block">Свой размер</span>
        </q-btn>
      </div>
      <EditInsertTableDialog
        v-else
        :class="classPrevent"
        @cancel="handleCancel"
        @pasteTable="handleInsertTable"
      />
    </div>
  </q-btn-dropdown>
</template>

<script setup lang="ts">
//core
import { Editor } from '@tiptap/vue-3';
import { shallowRef, computed, ref } from 'vue';
import { Screen } from 'quasar';
// utils
import { ICONS } from 'src/utils/icons';
import EditInsertTableDialog from './EditorInsertTableDialog.vue';

const props = defineProps<{
  editorInstance: Editor;
  classPrevent?: string;
}>();

// var
const isOpenSelect = shallowRef(false);
const isOpenFields = ref<boolean>(false);
const tableInstance = shallowRef([10, 10]);
const tableInsertValue = shallowRef<{ row: number; col: number } | null>(null);

// computed
const isDisabled = computed(() => {
  return props.editorInstance.isActive('table');
});

const textTitle = computed(() => {
  let title = 'Вставка таблицы';

  if (tableInsertValue.value) {
    title = `Таблица: ${tableInsertValue.value.row} x ${tableInsertValue.value.col}`;
  }

  return title;
});
const isMobile = computed(() => Screen.width <= 650);
// function
const handleInsertTable = (table: { rows: number; cols: number }) => {
  props.editorInstance
    .chain()
    .focus()
    .insertTable({
      rows: table.rows,
      cols: table.cols,
      withHeaderRow: true,
    })
    .run();

  isOpenSelect.value = false;
  tableInsertValue.value = null;
  isOpenFields.value = false;
};

const handleMoseMove = (row: number, col: number) => {
  tableInsertValue.value = { row, col };
};
const handleCancel = () => {
  if (isMobile.value) isOpenSelect.value = false;
  isOpenFields.value = false;
};
const getCellClass = (row: number, col: number) => {
  if (!tableInsertValue.value) {
    return null;
  }

  return {
    highlighted:
      row <= tableInsertValue.value?.row && col <= tableInsertValue.value?.col,
  };
};
</script>
<style lang="scss">
.q-menu.table-select.table-select {
  border: 1px solid $extra-light;
  padding: 1.5rem !important;
}
</style>

<style lang="scss" scoped>
.table-select {
  &__title {
    margin-top: 0 !important;
    margin-bottom: 1rem !important;
    font-weight: 500;
  }

  ul,
  li {
    list-style: none;
    padding: 0;
    margin: 0;
    line-height: 0;
  }

  ul.table-select__list {
    display: flex;
    flex-direction: column;
    width: fit-content;
    margin-bottom: 1rem;
    gap: 0;

    .table-select__row {
      .table-select__cols {
        display: flex;

        .table-select__cell {
          height: 20px;
          width: 20px;
          border: 0.5px solid $dark-gray;
          cursor: pointer;
          position: relative;

          &:first-child {
            border-left-width: 1px;
          }

          &:last-child {
            border-right-width: 1px;
          }

          &.highlighted {
            position: relative;

            &:before {
              content: '';
              position: absolute;
              width: 22px;
              height: 22px;
              border: 2px solid $primary;
              top: -2px;
              left: -2px;
              z-index: 10;
            }
          }
        }
      }

      &:first-child {
        .table-select__cell {
          border-top-width: 1px;

          &.highlighted {
            &:before {
              top: -2px;
              border-top-width: 2px;
            }
          }
        }
      }

      &:last-child {
        .table-select__cell {
          border-bottom-width: 1px;
        }
      }
    }
  }

  &__btn {
    font-size: 1rem;

    :deep(.q-btn__content) {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      line-height: 1;
    }
  }
}
</style>
