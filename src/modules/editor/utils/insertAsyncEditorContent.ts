import type { Editor, JSONContent } from '@tiptap/core';
import type { Transaction } from '@tiptap/pm/state';

export async function insertAsyncEditorContent(
  editor: Editor,
  load: () => Promise<JSONContent[] | string>,
  position?: number,
) {
  if (editor.isDestroyed || !editor.isEditable) return false;
  let from = position ?? editor.state.selection.from;
  let to = position ?? editor.state.selection.to;
  let cancelled = false;
  const cancel = () => {
    cancelled = true;
  };
  const checkEditable = () => {
    if (!editor.isEditable) cancel();
  };
  const track = ({ transaction }: { transaction: Transaction }) => {
    if (!editor.isEditable) cancel();
    if (!transaction.docChanged) return;
    const start = transaction.mapping.mapResult(from, 1);
    const end = transaction.mapping.mapResult(to, from === to ? 1 : -1);
    if (
      start.deletedAcross ||
      end.deletedAcross ||
      (from !== to && start.pos >= end.pos)
    )
      cancel();
    from = start.pos;
    to = end.pos;
  };
  editor.on('transaction', track);
  editor.on('update', checkEditable);
  editor.on('destroy', cancel);
  try {
    const content = await load();
    if (
      cancelled ||
      editor.isDestroyed ||
      !editor.isEditable ||
      !content.length
    )
      return false;
    return editor.commands.insertContentAt({ from, to }, content, {
      updateSelection: false,
    });
  } finally {
    editor.off('transaction', track);
    editor.off('update', checkEditable);
    editor.off('destroy', cancel);
  }
}
