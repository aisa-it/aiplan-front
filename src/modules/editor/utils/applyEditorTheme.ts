import type { Editor } from '@tiptap/core';
import { DOMParser, DOMSerializer, Mark } from '@tiptap/pm/model';
import { Selection } from '@tiptap/pm/state';
import { normalizeEditorContent } from './normalizeEditorContent';

export function applyEditorTheme(editor: Editor, theme: 'light' | 'dark') {
  const element = document.createElement('div');
  element.innerHTML = normalizeEditorContent(editor.getHTML(), theme);
  const themed = DOMParser.fromSchema(editor.schema).parse(element, {
    preserveWhitespace: 'full',
  });
  const original = editor.state.doc;
  let compatible = original.content.size === themed.content.size;
  const tr = editor.state.tr;
  themed.descendants((node, pos) => {
    const previous = original.nodeAt(pos);
    if (
      !previous ||
      previous.type !== node.type ||
      previous.nodeSize !== node.nodeSize ||
      (node.isText && previous.text !== node.text)
    ) {
      compatible = false;
      return false;
    }
    if (node.isText) {
      if (!Mark.sameSet(previous.marks, node.marks)) {
        tr.removeMark(pos, pos + node.nodeSize);
        node.marks.forEach((mark) =>
          tr.addMark(pos, pos + node.nodeSize, mark),
        );
      }
    } else if (
      JSON.stringify(previous.attrs) !== JSON.stringify(node.attrs) ||
      !Mark.sameSet(previous.marks, node.marks)
    ) {
      tr.setNodeMarkup(pos, undefined, node.attrs, node.marks);
    }
  });
  if (!compatible) return;
  let storedMarks = editor.state.storedMarks;
  if (storedMarks?.length) {
    const sample = document.createElement('p');
    sample.append(
      DOMSerializer.fromSchema(editor.schema).serializeNode(
        editor.schema.text('x', storedMarks),
      ),
    );
    sample.innerHTML = normalizeEditorContent(sample.innerHTML, theme);
    DOMParser.fromSchema(editor.schema)
      .parse(sample)
      .descendants((node) => {
        if (node.isText) storedMarks = node.marks;
      });
  }
  if (!tr.docChanged && storedMarks === editor.state.storedMarks) return;
  tr.setSelection(Selection.fromJSON(tr.doc, editor.state.selection.toJSON()));
  tr.setStoredMarks(storedMarks);
  editor.view.dispatch(
    tr.setMeta('addToHistory', false).setMeta('preventUpdate', true),
  );
}
