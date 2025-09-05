<template>
  <transition>
    <div
      v-if="isShowTooltip || isShowTableHelper"
      ref="tableTooltipRef"
      class="table-tooltip"
      :style="{ top: tooltipTop + 'px', left: tooltipLeft + 'px' }"
    >
      <q-btn
        v-if="isShowTooltip"
        flat
        dense
        no-caps
        class="btn secondary-button btn-show-table"
        @click="handleShowTableHelper"
      >
        ...
      </q-btn>
      <div
        v-show="isShowTableHelper"
        ref="tableToolbar"
        class="table-tooltip__actions"
      >
        <q-btn
          v-for="(operation, operationKey) in operationMenuTable"
          :key="operationKey"
          flat
          dense
          no-caps
          class="btn secondary-button"
          @click="operation.handleClick"
        >
          <q-icon v-if="operation.iconName" dense :name="operation.iconName" />
          <component v-else :is="ICONS[`${operation.icon}`]" />
          <HintTooltip>
            {{ operation.text }}
          </HintTooltip>
        </q-btn>
      </div>
    </div>
  </transition>
</template>

<script lang="ts">
//core
import { Editor } from '@tiptap/vue-3';
import { defineComponent, onMounted, PropType, ref, watch } from 'vue';

// utils
import { ICONS } from 'src/utils/icons';
import { mouseWheelScrollHandler } from 'src/utils/mouseWheelScrollHandler';

export default defineComponent({
  name: 'EditorTooltipTable',
  props: {
    editorInstance: {
      type: Object as PropType<Editor>,
      required: true,
    },
  },
  emits: ['closeTableTooltip'],
  setup(props, { emit }) {
    // vars
    const tooltipTop = ref<number>(0);
    const tooltipLeft = ref<number>(0);
    const tableToolbar = ref<HTMLElement | null>(null);
    const isShowTooltip = ref<boolean>(false);
    const tableTooltipRef = ref<HTMLElement | null>(null);
    const isShowTableHelper = ref<boolean>(false);

    const operationMenuTable = ref({
      addColumnBefore: {
        text: 'Вставить столбец слева',
        icon: 'tableAddColumnBeforeIcon',
        handleClick: () => {
          props.editorInstance.chain().focus().addColumnBefore().run();
        },
      },
      addColumnAfter: {
        text: 'Вставить столбец справа',
        icon: 'tableAddColumnAfterIcon',
        handleClick: () => {
          props.editorInstance.chain().focus().addColumnAfter().run();
        },
      },
      deleteColumn: {
        text: 'Удалить столбец',
        icon: 'tableDeleteColumnIcon',
        handleClick: () => {
          props.editorInstance.chain().focus().deleteColumn().run();
        },
      },
      addRowBefore: {
        text: 'Вставить строку сверху',
        icon: 'tableAddRowBeforeIcon',
        handleClick: () => {
          props.editorInstance.chain().focus().addRowBefore().run();
        },
      },
      addRowAfter: {
        text: 'Вставить строку снизу',
        icon: 'tableAddRowAfterIcon',
        handleClick: () => {
          props.editorInstance.chain().focus().addRowAfter().run();
        },
      },
      deleteRow: {
        text: 'Удалить строку',
        icon: 'tableDeleteRowIcon',
        handleClick: () => {
          props.editorInstance.chain().focus().deleteRow().run();
        },
      },
      deleteTable: {
        text: 'Удалить таблицу',
        icon: 'tableDeleteIcon',
        handleClick: () => {
          props.editorInstance.chain().focus().deleteTable().run();
        },
      },
      mergeCells: {
        text: 'Объединить ячейки',
        icon: 'tableMergeCellsIcon',
        handleClick: () => {
          props.editorInstance.chain().focus().mergeCells().run();
        },
      },
      splitCell: {
        text: 'Разделить ячейку',
        icon: 'tableSplitCellIcon',
        handleClick: () => {
          props.editorInstance.chain().focus().splitCell().run();
        },
      },
      headerCell: {
        text: 'Переключить ячейку заголовка',
        iconName: 'view_column',
        handleClick: () => {
          props.editorInstance.chain().focus().toggleHeaderCell().run();
        },
      },
    });

    // function

    const closeTooltip = () => {
      isShowTooltip.value = false;
      isShowTableHelper.value = false;
      emit('closeTableTooltip');
    };

    const coordinate = () => {
      const editor = props.editorInstance;
      const { from } = editor.state.selection;

      const editorView = editor.view;

      // определение ячейки, в которой находится курсор
      const domAtPos = editorView.domAtPos(from);
      let cell: HTMLElement | null = domAtPos.node as HTMLElement;
      while (cell && cell.nodeName !== 'TD' && cell.nodeName !== 'TH') {
        cell = cell.parentElement;
      }

      if (!cell) {
        return;
      }

      // координаты ячейки
      const cellRect = cell.getBoundingClientRect();

      // границы контейнера редактора
      const editorBounds = editorView.dom.getBoundingClientRect();

      // padding контейнера редактора
      const editorStyles = window.getComputedStyle(editorView.dom);
      const paddingLeft = parseFloat(editorStyles.paddingLeft);

      // позиция тултипа
      const top = cellRect.top - editorBounds.top + cellRect.height + 5;
      const left = cellRect.left - editorBounds.left - 27 + paddingLeft / 2;

      tooltipTop.value = top;
      tooltipLeft.value = left;
    };

    const handleShowTableHelper = (e: any) => {
      e.stopPropagation();
      isShowTooltip.value = false;
      isShowTableHelper.value = true;
    };

    const showTooltipAtPosition = () => {
      isShowTableHelper.value = false;
      isShowTooltip.value = true;
      const editor = props.editorInstance;
      const isInTable = editor.isActive('table');

      if (!isInTable) {
        isShowTooltip.value = false;
        console.log('1');

        return;
      }
      coordinate();
    };

    // hook

    onMounted(() => {
      document.addEventListener('click', closeTooltip);
    });

    watch(
      () => props.editorInstance,
      (newEditor, oldEditor) => {
        if (oldEditor) {
          newEditor.off('selectionUpdate', showTooltipAtPosition);
        }

        if (newEditor) {
          newEditor.on('selectionUpdate', showTooltipAtPosition);
        }
      },
      { immediate: true },
    );

    watch(
      () => tableToolbar.value,
      (newValue) => {
        if (newValue) {
          mouseWheelScrollHandler(newValue, false);
        }
      },
    );

    return {
      ICONS,
      tooltipTop,
      tooltipLeft,
      tableToolbar,
      isShowTooltip,
      tableTooltipRef,
      isShowTableHelper,
      operationMenuTable,
      handleShowTableHelper,
    };
  },
});
</script>

<style lang="scss" scoped>
.table-tooltip {
  position: absolute;
  z-index: 1000;

  &__actions {
    display: flex;
    max-width: fit-content;
    width: 100%;
    max-height: fit-content;
    margin-left: 20px;
    gap: 5px;
    padding: 5px;
    background-color: $base;
    border: 1px solid $border-color;
    overflow: auto;
    border-radius: $radius;

    .btn {
      min-height: 30px;
      min-width: 30px;
      max-width: 30px;
      max-height: 30px;
      border-radius: 0;
      padding: 2px;
      font-size: 11px;
      line-height: 1;
      display: flex;
    }
  }

  .q-btn__content {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .btn-show-table {
    padding: 2px 2px 5px;
    border-radius: 50%;
    line-height: 1;
    display: flex;
    min-width: 19px;
    min-height: 19px;
    max-width: 19px;
    max-height: 19px;
    font-weight: 700;
    font-size: 11px;
  }

  .v-enter-active,
  .v-leave-active {
    transition: opacity 0.5s ease;
  }

  .v-enter-from,
  .v-leave-to {
    opacity: 0;
  }
}
</style>
