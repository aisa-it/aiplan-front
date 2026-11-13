import { onBeforeUnmount, onMounted, ref } from 'vue';
import type { Editor } from '@tiptap/vue-3';

export function useEditorRevision(editor: Editor) {
  const revision = ref(0);

  const refresh = () => {
    revision.value += 1;
  };

  onMounted(() => {
    editor.on('transaction', refresh);
  });

  onBeforeUnmount(() => {
    editor.off('transaction', refresh);
  });

  return revision;
}
