<template>
  <div class="editor-table-toolbar" aria-label="Инструменты таблицы" @wheel.stop.prevent="handleWheel">
    <EditorInsertTableMenu :editor="editor" :disabled="!canInsertTable" />

    <EditorToolbarButton
      v-for="operation in TABLE_OPERATIONS"
      :key="operation.command"
      :icon="operation.icon"
      :tooltip="operation.tooltip"
      :disabled="!canRunCommand(operation.command)"
      @click="runCommand(operation.command)"
    />

    <EditorTableFillMenu :editor="editor" :disabled="!isInTable" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Editor } from '@tiptap/vue-3';

import { useEditorRevision } from '../composables/useEditorRevision';
import EditorInsertTableMenu from './EditorInsertTableMenu.vue';
import EditorTableFillMenu from './EditorTableFillMenu.vue';
import EditorToolbarButton from './EditorToolbarButton.vue';

const props = defineProps<{
  editor: Editor;
}>();

const handleWheel = (event: WheelEvent) => {
  const element = event.currentTarget as HTMLElement;
  const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
  const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? element.clientWidth : 1;
  element.scrollLeft += delta * unit;
};

const TABLE_OPERATIONS = [
  {
    command: 'addColumnBefore',
    icon: 'table-add-column-before',
    tooltip: 'Вставить столбец слева',
  },
  {
    command: 'addColumnAfter',
    icon: 'table-add-column-after',
    tooltip: 'Вставить столбец справа',
  },
  {
    command: 'deleteColumn',
    icon: 'table-delete-column',
    tooltip: 'Удалить столбец',
  },
  {
    command: 'addRowBefore',
    icon: 'table-add-row-before',
    tooltip: 'Вставить строку сверху',
  },
  {
    command: 'addRowAfter',
    icon: 'table-add-row-after',
    tooltip: 'Вставить строку снизу',
  },
  {
    command: 'deleteRow',
    icon: 'table-delete-row',
    tooltip: 'Удалить строку',
  },
  {
    command: 'deleteTable',
    icon: 'table-delete',
    tooltip: 'Удалить таблицу',
  },
  {
    command: 'mergeCells',
    icon: 'table-merge-cells',
    tooltip: 'Объединить ячейки',
  },
  {
    command: 'splitCell',
    icon: 'table-split-cell',
    tooltip: 'Разделить ячейку',
  },
  {
    command: 'toggleHeaderCell',
    icon: 'table-header-cell',
    tooltip: 'Переключить ячейку заголовка',
  },
] as const;

type TableCommand = (typeof TABLE_OPERATIONS)[number]['command'];

const revision = useEditorRevision(props.editor);
const isInTable = computed(() => {
  void revision.value;
  return props.editor.isActive('table');
});

const canInsertTable = computed(() => {
  void revision.value;
  return !isInTable.value && !props.editor.isActive('codeBlock') &&
    props.editor.can().insertTable({ rows: 1, cols: 1 });
});

const runCommand = (command: TableCommand) => {
  const chain = props.editor.chain().focus();

  switch (command) {
    case 'addColumnBefore':
      chain.addColumnBefore().run();
      break;
    case 'addColumnAfter':
      chain.addColumnAfter().run();
      break;
    case 'deleteColumn':
      chain.deleteColumn().run();
      break;
    case 'addRowBefore':
      chain.addRowBefore().run();
      break;
    case 'addRowAfter':
      chain.addRowAfter().run();
      break;
    case 'deleteRow':
      chain.deleteRow().run();
      break;
    case 'deleteTable':
      chain.deleteTable().run();
      break;
    case 'mergeCells':
      chain.mergeCells().run();
      break;
    case 'splitCell':
      chain.splitCell().run();
      break;
    case 'toggleHeaderCell':
      chain.toggleHeaderCell().run();
  }
};

const canRunCommand = (command: TableCommand) => {
  void revision.value;
  return props.editor.isEditable && isInTable.value && props.editor.can()[command]();
};
</script>

<style scoped>
.editor-table-toolbar {
  display: flex;
  min-width: 0;
  overflow-x: auto;
  scrollbar-width: none;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
  border-top: 1px solid rgb(var(--v-theme-border));
}
.editor-table-toolbar::-webkit-scrollbar { display: none; }
.editor-table-toolbar :deep(.editor-toolbar-button) { flex-shrink: 0; }
</style>

