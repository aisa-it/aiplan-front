import { Extension } from '@tiptap/core';
import { Plugin } from '@tiptap/pm/state';

// Полностью отключает редактирование у ячейки в таблице. Работает с contenteditable="false"
export const NonEditableCellPlugin = Extension.create({
  name: 'nonEditableCell',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        props: {
          editable: (state) => {
            const { $from } = state.selection;

            for (let depth = $from.depth; depth > 0; depth--) {
              const node = $from.node(depth);
              if (node.type.name === 'tableCell' || node.type.name === 'tableHeader') {
                if (node.attrs.editable === false) {
                  return false;
                }
                break;
              }
            }
            return true;
          },
        },
      }),
    ];
  },
});
