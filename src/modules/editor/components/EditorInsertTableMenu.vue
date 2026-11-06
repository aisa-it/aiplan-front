<template>
  <v-menu
    v-model="isOpen"
    :close-on-content-click="false"
  >
    <template #activator="{ props: menuProps }">
      <EditorToolbarButton
        v-bind="menuProps"
        icon="table-insert"
        tooltip="Вставить таблицу"
        :disabled="disabled"
        aria-haspopup="menu"
      />
    </template>

    <v-card class="editor-insert-table-menu" elevation="4">
      <div class="editor-insert-table-menu__title">
        {{ menuTitle }}
      </div>

      <template v-if="!isCustomSize">
        <div
          class="editor-insert-table-menu__grid"
          @mouseleave="hoveredSize = undefined"
        >
          <button
            v-for="cell in gridCells"
            :key="`${cell.row}-${cell.col}`"
            type="button"
            :aria-label="`Таблица ${cell.row} на ${cell.col}`"
            class="editor-insert-table-menu__cell"
            :class="{
              'editor-insert-table-menu__cell--active': isCellActive(cell),
            }"
            @mouseenter="hoveredSize = cell"
            @focus="hoveredSize = cell"
            @click="insertGridTable(cell)"
          />
        </div>

        <v-btn
          prepend-icon="mdi-table-edit"
          variant="text"
          size="small"
          class="editor-insert-table-menu__custom-button"
          @click="isCustomSize = true"
        >
          Свой размер
        </v-btn>
      </template>

      <template v-else>
        <v-text-field
          v-model.number="customSize.cols"
          type="number"
          label="Число столбцов"
          min="1"
          max="100"
          density="compact"
          hide-details="auto"
          :rules="[validateSize('cols')]"
        />
        <v-text-field
          v-model.number="customSize.rows"
          type="number"
          label="Число строк"
          min="1"
          max="100"
          density="compact"
          hide-details="auto"
          :rules="[validateSize('rows')]"
        />

        <div class="editor-insert-table-menu__actions">
          <v-btn variant="text" size="small" @click="isCustomSize = false">
            Отмена
          </v-btn>
          <v-btn
            variant="text"
            size="small"
            :disabled="!isCustomSizeValid"
            @click="insertTable(customSize)"
          >
            Вставить
          </v-btn>
        </div>
      </template>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import type { Editor } from '@tiptap/vue-3';

import EditorToolbarButton from './EditorToolbarButton.vue';

interface TableSize {
  rows: number;
  cols: number;
}

interface TableGridCell {
  row: number;
  col: number;
}

const props = withDefaults(
  defineProps<{
    editor: Editor;
    disabled?: boolean;
  }>(),
  {
    disabled: false,
  },
);

const isOpen = ref(false);
const isCustomSize = ref(false);
const hoveredSize = ref<TableGridCell>();
const customSize = reactive<TableSize>({ rows: 2, cols: 2 });

const gridCells = Array.from({ length: 100 }, (_, index) => ({
  row: Math.floor(index / 10) + 1,
  col: (index % 10) + 1,
}));

const menuTitle = computed(() =>
  hoveredSize.value
    ? `Таблица: ${hoveredSize.value.row} x ${hoveredSize.value.col}`
    : 'Вставка таблицы',
);

const isCustomSizeValid = computed(
  () =>
    Number.isInteger(customSize.rows) &&
    Number.isInteger(customSize.cols) &&
    customSize.rows >= 1 &&
    customSize.rows <= 100 &&
    customSize.cols >= 1 &&
    customSize.cols <= 100,
);

const validateSize = (field: keyof TableSize) => (value: number) => {
  if (!Number.isInteger(value) || value < 1 || value > 100) {
    return field === 'rows'
      ? 'Число строк от 1 до 100'
      : 'Число столбцов от 1 до 100';
  }

  return true;
};

const isCellActive = (cell: TableGridCell) =>
  hoveredSize.value &&
  cell.row <= hoveredSize.value.row &&
  cell.col <= hoveredSize.value.col;

const insertTable = ({ rows, cols }: TableSize) => {
  if (props.disabled || ![rows, cols].every(
    (size) => Number.isInteger(size) && size >= 1 && size <= 100,
  )) return;

  const inserted = props.editor
    .chain()
    .focus()
    .insertTable({ rows, cols, withHeaderRow: true })
    .run();
  if (inserted) isOpen.value = false;
};

const insertGridTable = ({ row, col }: TableGridCell) => {
  insertTable({ rows: row, cols: col });
};

watch(isOpen, (value) => {
  if (value) return;

  hoveredSize.value = undefined;
  isCustomSize.value = false;
  customSize.rows = 2;
  customSize.cols = 2;
});
</script>

<style scoped>
.editor-insert-table-menu {
  width: 246px;
  padding: 16px;
}

.editor-insert-table-menu__title {
  margin-bottom: 12px;
  font-weight: 500;
}

.editor-insert-table-menu__grid {
  display: grid;
  grid-template-columns: repeat(10, 20px);
  margin-bottom: 12px;
}

.editor-insert-table-menu__cell {
  width: 20px;
  height: 20px;
  border: 1px solid rgb(var(--v-theme-border));
  background: transparent;
}

.editor-insert-table-menu__cell:hover,
.editor-insert-table-menu__cell:focus-visible,
.editor-insert-table-menu__cell--active {
  position: relative;
  z-index: 1;
  border-color: rgb(var(--v-theme-primary));
  background-color: rgb(var(--v-theme-primary), 0.14);
}

.editor-insert-table-menu__custom-button {
  width: 100%;
  justify-content: flex-start;
}

.editor-insert-table-menu__actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
}
</style>

