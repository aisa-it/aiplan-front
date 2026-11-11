import type { Editor } from '@tiptap/core';

export function getEditorHtml(editor: Editor): string {
  return editor.getHTML();
}
