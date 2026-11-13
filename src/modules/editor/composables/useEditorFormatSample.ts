import type { Mark } from '@tiptap/pm/model';
import type { Editor } from '@tiptap/vue-3';
import { readonly, ref, watch, type ShallowRef } from 'vue';

const WORD_CHARACTER_PATTERN = /[\p{L}\p{N}_'’-]/u;

const getSelectionMarks = (editor: Editor) => {
  const { doc, selection, storedMarks } = editor.state;

  if (selection.empty) {
    return [...(storedMarks ?? selection.$from.marks())];
  }

  let marks: readonly Mark[] = [];
  let marksFound = false;
  doc.nodesBetween(selection.from, selection.to, (node) => {
    if (!node.isText || marksFound) return;

    marks = node.marks;
    marksFound = true;
    return false;
  });

  return [...marks];
};

export const getWordRange = (editor: Editor) => {
  const { $from } = editor.state.selection;

  const text = $from.parent.textBetween(
    0,
    $from.parent.content.size,
    '',
    '\uFFFC',
  );
  let start = $from.parentOffset;
  let end = $from.parentOffset;

  while (start > 0 && WORD_CHARACTER_PATTERN.test(text[start - 1] ?? '')) {
    start -= 1;
  }

  while (end < text.length && WORD_CHARACTER_PATTERN.test(text[end] ?? '')) {
    end += 1;
  }

  if (start === end) return undefined;

  return {
    from: $from.start() + start,
    to: $from.start() + end,
  };
};

export const useEditorFormatSample = (editor: ShallowRef<Editor | null>) => {
  const active = ref(false);
  let sampleMarks: Mark[] = [];

  const clear = () => {
    active.value = false;
    sampleMarks = [];
  };

  const toggle = () => {
    if (active.value) {
      clear();
      return;
    }

    if (!editor.value) return;

    sampleMarks = getSelectionMarks(editor.value);
    active.value = true;
  };

  const apply = () => {
    const currentEditor = editor.value;
    if (!currentEditor || !active.value) return;

    const { selection } = currentEditor.state;
    const range = selection.empty
      ? getWordRange(currentEditor)
      : { from: selection.from, to: selection.to };

    if (!range) {
      clear();
      return;
    }

    const transaction = currentEditor.state.tr.removeMark(range.from, range.to);

    for (const mark of sampleMarks) {
      transaction.addMark(range.from, range.to, mark);
    }

    currentEditor.view.dispatch(transaction);
    clear();
  };

  watch(editor, clear);

  return {
    active: readonly(active),
    apply,
    clear,
    toggle,
  };
};
