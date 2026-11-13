import {
  Table,
  TableCell,
  TableHeader,
  TableRow,
  TableView,
} from '@tiptap/extension-table';
import type { Node as ProseMirrorNode } from '@tiptap/pm/model';
import { columnResizing, tableEditing } from '@tiptap/pm/tables';

class EditorTableView extends TableView {
  override update(node: ProseMirrorNode) {
    if (!super.update(node)) return false;

    const row = node.firstChild;
    let column = 0;
    if (row) {
      for (let cellIndex = 0; cellIndex < row.childCount; cellIndex += 1) {
        const cell = row.child(cellIndex);
        for (
          let index = 0;
          index < cell.attrs.colspan;
          index += 1, column += 1
        ) {
          if (cell.attrs.colwidth?.[index]) continue;
          (
            this.colgroup.children[column] as HTMLTableColElement | undefined
          )?.style.removeProperty('width');
        }
      }
    }

    return true;
  }
}

const cellAttributes = {
  'data-bgcolor': {
    default: null,
    parseHTML: (element: HTMLElement) =>
      element.getAttribute('data-bgcolor') || null,
    renderHTML: (attributes: Record<string, unknown>) =>
      attributes['data-bgcolor']
        ? { 'data-bgcolor': attributes['data-bgcolor'] }
        : {},
  },
  backgroundColor: {
    default: null,
    parseHTML: (element: HTMLElement) => element.style.backgroundColor || null,
    renderHTML: (attributes: Record<string, unknown>) =>
      attributes.backgroundColor
        ? { style: `background-color: ${attributes.backgroundColor}` }
        : {},
  },
};

export const EditorTable = Table.extend({
  addProseMirrorPlugins() {
    return [
      columnResizing({
        handleWidth: this.options.handleWidth,
        cellMinWidth: this.options.cellMinWidth,
        defaultCellMinWidth: this.options.cellMinWidth,
        View: this.options.View,
        lastColumnResizable: this.options.lastColumnResizable,
      }),
      tableEditing({
        allowTableNodeSelection: this.options.allowTableNodeSelection,
      }),
    ];
  },
}).configure({
  resizable: true,
  cellMinWidth: 25,
  View: EditorTableView,
});

export const EditorTableRow = TableRow;

export const EditorTableCell = TableCell.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      ...cellAttributes,
    };
  },
});

export const EditorTableHeader = TableHeader.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      ...cellAttributes,
    };
  },
});
