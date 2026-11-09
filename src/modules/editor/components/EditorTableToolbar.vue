<template>
  <div class="editor-table-toolbar" :aria-label="t('editor.tableTools')" @wheel.stop.prevent="handleWheel">
    <EditorInsertTableMenu :editor="editor" :disabled="!canInsertTable" />

    <EditorToolbarButton
      v-for="operation in TABLE_OPERATIONS"
      :key="operation.command"
      :icon="operation.icon"
      :tooltip="t(operation.tooltipKey)"
      :disabled="!canRunCommand(operation.command)"
      @click="runCommand(operation.command)"
    />

    <EditorTableFillMenu :editor="editor" :disabled="!isInTable" />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import { computed } from 'vue';
import type { Editor } from '@tiptap/vue-3';

import { useEditorRevision } from '../composables/useEditorRevision';
import EditorInsertTableMenu from './EditorInsertTableMenu.vue';
import EditorTableFillMenu from './EditorTableFillMenu.vue';
import EditorToolbarButton from './EditorToolbarButton.vue';

const { t } = useI18n();

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
    tooltipKey: 'editor.insertColumnToTheLeft',
  },
  {
    command: 'addColumnAfter',
    icon: 'table-add-column-after',
    tooltipKey: 'editor.insertColumnToTheRight',
  },
  {
    command: 'deleteColumn',
    icon: 'table-delete-column',
    tooltipKey: 'editor.deleteColumn',
  },
  {
    command: 'addRowBefore',
    icon: 'table-add-row-before',
    tooltipKey: 'editor.insertRowAbove',
  },
  {
    command: 'addRowAfter',
    icon: 'table-add-row-after',
    tooltipKey: 'editor.insertRowBelow',
  },
  {
    command: 'deleteRow',
    icon: 'table-delete-row',
    tooltipKey: 'editor.deleteRow',
  },
  {
    command: 'deleteTable',
    icon: 'table-delete',
    tooltipKey: 'editor.deleteTable',
  },
  {
    command: 'mergeCells',
    icon: 'table-merge-cells',
    tooltipKey: 'editor.mergeCells',
  },
  {
    command: 'splitCell',
    icon: 'table-split-cell',
    tooltipKey: 'editor.splitCell',
  },
  {
    command: 'toggleHeaderCell',
    icon: 'table-header-cell',
    tooltipKey: 'editor.toggleHeaderCell',
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

