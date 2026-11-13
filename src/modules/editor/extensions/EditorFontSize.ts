import { Extension } from '@tiptap/core';

import { DEFAULT_EDITOR_FONT_SIZE } from '../constants/editor.constants';

const nextSize = (value: unknown, step: number) => {
  const size = typeof value === 'string' ? Number.parseFloat(value) : NaN;
  return `${Math.max(2, (Number.isFinite(size) ? size : Number.parseFloat(DEFAULT_EDITOR_FONT_SIZE)) + step)}px`;
};

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    editorFontSize: {
      stepFontSize: (step: 2 | -2) => ReturnType;
    };
  }
}

export const EditorFontSize = Extension.create({
  name: 'editorFontSize',
  addCommands() {
    return {
      stepFontSize: (step) => ({ editor, tr, commands, dispatch }) => {
        if (editor.isActive('codeBlock') || editor.isActive('heading')) return false;
        const { from, to, empty } = tr.selection;
        if (empty) {
          return commands.setFontSize(nextSize(editor.getAttributes('textStyle').fontSize, step));
        }
        const type = editor.schema.marks.textStyle;
        if (!type) return false;
        tr.doc.nodesBetween(from, to, (node, position) => {
          if (node.type.name === 'codeBlock' || node.type.name === 'heading') return false;
          if (!node.isText) return;
          const attributes = node.marks.find((mark) => mark.type === type)?.attrs ?? {};
          if (dispatch) tr.addMark(Math.max(from, position), Math.min(to, position + node.nodeSize),
            type.create({ ...attributes, fontSize: nextSize(attributes.fontSize, step) }));
        });
        return true;
      },
    };
  },
});
