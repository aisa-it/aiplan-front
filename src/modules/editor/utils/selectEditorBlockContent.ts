import type { Editor } from '@tiptap/core';
import { NodeSelection, TextSelection } from '@tiptap/pm/state';

export const selectEditorBlockContent = (
  editor: Editor,
  getPos: () => number | undefined,
) => {
  if (!editor.isEditable) return;
  const pos = getPos();
  if (typeof pos !== 'number') return;

  const node = editor.state.doc.nodeAt(pos);
  if (!node) return;
  const nearby = TextSelection.near(editor.state.doc.resolve(pos + 1));
  const selection =
    nearby.from > pos && nearby.to < pos + node.nodeSize
      ? nearby
      : NodeSelection.create(editor.state.doc, pos);
  editor.view.dispatch(editor.state.tr.setSelection(selection));
};

export const getSelectedEditorBlock = (editor: Editor, name: string) => {
  const selection = editor.state.selection;
  if (selection instanceof NodeSelection && selection.node.type.name === name) {
    return { node: selection.node, pos: selection.from };
  }
  const { $from } = selection;
  for (let depth = $from.depth; depth > 0; depth -= 1) {
    const node = $from.node(depth);
    if (node.type.name === name) return { node, pos: $from.before(depth) };
  }
};
