<template>
  <transition name="fade">
    <div
      v-if="isShowToolbar"
      ref="tableToolbar"
      class="table-toolbar"
      :class="classPrevent"
    >
      <EditorSelectTable
        :editor-instance="editorInstance"
        :class-prevent="classPrevent"
      />
      <q-btn
        v-for="(operation, operationKey) in operationMenuTable"
        :key="operationKey"
        flat
        dense
        no-caps
        :disable="operation.isDisable"
        @click="runCommand(operation.commandName)"
      >
        <component
          :is="operation.icon"
          :width="operation.size"
          :height="operation.size"
        />
        <HintTooltip>
          {{ operation.text }}
        </HintTooltip>
      </q-btn>
      <EditorTableFillButton
        :disable="!props.editorInstance.isActive('table')"
        :editor-instance="editorInstance"
        :class-prevent="classPrevent"
        :isMobile="isMobile"
      />
      <EditorTableIssueButton :editor-instance="editorInstance" @create-issue-table="$emit('create-issue-table')"/>
    </div>
  </transition>
</template>

<script setup lang="ts">
//core
import { Editor } from '@tiptap/vue-3';
import { computed } from 'vue';

// utils
import { ICONS } from 'src/utils/icons';
import EditorSelectTable from './EditorSelectTable.vue';
import EditorTableFillButton from './EditorTableFillButton.vue';
import EditorTableIssueButton from './EditorTableIssueButton.vue';

const props = defineProps<{
  editorInstance: Editor;
  isShowToolbar?: boolean;
  classPrevent?: string;
  isMobile?: boolean;
}>();

const emit = defineEmits(['create-issue-table']);

const operationMenuTable = computed(() => {
  return {
    addColumnBefore: {
      text: 'Вставить столбец слева',
      icon: ICONS.tableAddColumnBeforeIcon,
      isDisable: !props.editorInstance.isActive('table'),
      commandName: 'addColumnBefore',
    },
    addColumnAfter: {
      text: 'Вставить столбец справа',
      icon: ICONS.tableAddColumnAfterIcon,
      isDisable: !props.editorInstance.isActive('table'),
      commandName: 'addColumnAfter',
    },
    deleteColumn: {
      text: 'Удалить столбец',
      icon: ICONS.tableDeleteColumnIcon,
      isDisable: !props.editorInstance.isActive('table'),
      commandName: 'deleteColumn',
    },
    addRowBefore: {
      text: 'Вставить строку сверху',
      icon: ICONS.tableAddRowBeforeIcon,
      isDisable: !props.editorInstance.isActive('table'),
      commandName: 'addRowBefore',
    },
    addRowAfter: {
      text: 'Вставить строку снизу',
      icon: ICONS.tableAddRowAfterIcon,
      isDisable: !props.editorInstance.isActive('table'),
      commandName: 'addRowAfter',
    },
    deleteRow: {
      text: 'Удалить строку',
      icon: ICONS.tableDeleteRowIcon,
      isDisable: !props.editorInstance.isActive('table'),
      commandName: 'deleteRow',
    },
    deleteTable: {
      text: 'Удалить таблицу',
      icon: ICONS.tableDeleteIcon,
      isDisable: !props.editorInstance.isActive('table'),
      commandName: 'deleteTable',
    },
    mergeCells: {
      text: 'Объединить ячейки',
      icon: ICONS.tableMergeCellsIcon,
      isDisable: !props.editorInstance.isActive('table'),
      commandName: 'mergeCells',
    },
    splitCell: {
      text: 'Разделить ячейку',
      icon: ICONS.tableSplitCellIcon,
      isDisable: !props.editorInstance.isActive('table'),
      commandName: 'splitCell',
    },
    headerCell: {
      text: 'Переключить ячейку заголовка',
      icon: ICONS.tableHeaderCellIcon,
      isDisable: !props.editorInstance.isActive('table'),
      commandName: 'toggleHeaderCell',
    },
  };
});

const runCommand = (command: string) => {
  if (props.isMobile) {
    props.editorInstance.chain()[command]().run();
  } else {
    props.editorInstance.chain().focus()[command]().run();
  }
};
</script>

<style lang="scss" scoped>
.table-toolbar {
  display: flex;
  gap: 12px;
  align-items: center;
}
</style>
