import { onBeforeUnmount, onMounted, shallowRef, watch } from 'vue';
import { Editor } from '@tiptap/vue-3';

import type { UseEditorInstanceOptions } from '../model/editor.types';
import { getEditorHtml } from '../utils/getEditorHtml';

export function useEditorInstance(options: UseEditorInstanceOptions) {
  const editor = shallowRef<Editor | null>(null);
  const normalize = options.normalizeContent ?? ((html: string) => html);
  let synchronizedContent = normalize(options.content());

  onMounted(() => {
    editor.value = new Editor({
      content: synchronizedContent,
      editable: options.editable(),
      extensions: options.extensions(),
      editorProps: {
        attributes: {
          class: 'editor-tiptap__content',
        },
      },
      onUpdate: ({ editor: updatedEditor }) => {
        synchronizedContent = getEditorHtml(updatedEditor);
        options.onUpdate(synchronizedContent);
      },
    });
  });

  watch(options.content, (incomingContent) => {
    if (!editor.value) return;
    const content = normalize(incomingContent);

    if (content === synchronizedContent) return;

    if (content === getEditorHtml(editor.value)) {
      synchronizedContent = content;
      return;
    }

    editor.value.commands.setContent(content, { emitUpdate: false });
    synchronizedContent = content;
  });

  watch(options.editable, (editable) => {
    editor.value?.setEditable(editable, false);
  });

  onBeforeUnmount(() => {
    editor.value?.destroy();
    editor.value = null;
  });

  return {
    editor,
  };
}
