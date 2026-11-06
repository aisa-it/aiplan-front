import { Extension } from '@tiptap/core';
import { Plugin, TextSelection } from '@tiptap/pm/state';

const isOrdinaryTextBlock = (editor: EditorKeyboardContext) => {
  const { selection } = editor.state;
  return selection.$from.parent.isTextblock &&
    selection.$from.parent.type.name !== 'codeBlock' &&
    !editor.isActive('listItem') &&
    !editor.isActive('taskItem') &&
    !editor.isActive('table');
};

type EditorKeyboardContext = Pick<import('@tiptap/core').Editor, 'state' | 'isActive'>;

export const EditorKeyboard = Extension.create({
  name: 'editorKeyboard',
  addKeyboardShortcuts() {
    return {
      'Ctrl-Enter': () => true,
      Enter: () => {
        if (this.editor.isActive('subscript')) {
          this.editor.chain().focus().unsetSubscript().run();
        }
        if (this.editor.isActive('superscript')) {
          this.editor.chain().focus().unsetSuperscript().run();
        }
        return false;
      },
      Tab: () => {
        if (!isOrdinaryTextBlock(this.editor)) return false;
        const { state, dispatch } = this.editor.view;
        const { from, to } = state.selection;
        dispatch(state.tr.insertText('\t', from, to));
        return true;
      },
      'Shift-Tab': () => {
        if (!isOrdinaryTextBlock(this.editor)) return false;
        const { state, dispatch } = this.editor.view;
        const { from, empty, $from } = state.selection;
        if (!empty || $from.parentOffset < 2) return false;
        if (state.doc.textBetween(from - 1, from) !== '\t') return false;
        dispatch(state.tr.delete(from - 1, from));
        return true;
      },
    };
  },
  addProseMirrorPlugins() {
    return [new Plugin({
      props: {
        handleKeyDown(view, event) {
          if (!view.editable || (event.key !== 'PageUp' && event.key !== 'PageDown')) {
            return false;
          }
          event.preventDefault();
          event.stopPropagation();
          const { state } = view;
          const distance = view.dom.clientHeight / 4;
          const direction = event.key === 'PageUp' ? -1 : 1;
          const position = Math.max(0, Math.min(
            state.doc.content.size,
            Math.round(state.selection.$head.pos + direction * distance),
          ));
          const selection = TextSelection.near(state.doc.resolve(position), direction);
          view.dispatch(state.tr.setSelection(selection));
          return true;
        },
      },
    })];
  },
});
