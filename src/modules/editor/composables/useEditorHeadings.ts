import type { Editor } from '@tiptap/core';
import { onBeforeUnmount, ref, watch, type ShallowRef } from 'vue';

import type { EditorHeadingLink } from '../model/editor.types';

const createHeadingIndex = (counters: number[], level: number) => {
  counters[level - 1] += 1;
  counters.fill(0, level);

  return `${counters.slice(0, level).map((value) => value || 1).join('.')}.`;
};

export const useEditorHeadings = (editor: ShallowRef<Editor | null>) => {
  const links = ref<EditorHeadingLink[]>([]);
  let attachedEditor: Editor | null = null;

  const refresh = () => {
    const currentEditor = editor.value;
    if (!currentEditor) {
      links.value = [];
      return;
    }

    const counters = Array.from({ length: 6 }, () => 0);
    const nextLinks: EditorHeadingLink[] = [];

    currentEditor.state.doc.descendants((node, position) => {
      if (node.type.name !== 'heading') return;

      const level = Number(node.attrs.level);
      nextLinks.push({
        id: node.attrs.id || `editor-heading-${position}`,
        anchorId: node.attrs.anchorId || undefined,
        index: createHeadingIndex(counters, level),
        level,
        position,
        text: node.textContent,
      });
    });

    links.value = nextLinks;
  };

  const detach = () => {
    attachedEditor?.off('transaction', refresh);
    attachedEditor = null;
  };

  watch(
    editor,
    (currentEditor) => {
      detach();
      attachedEditor = currentEditor;
      attachedEditor?.on('transaction', refresh);
      refresh();
    },
    { immediate: true },
  );

  const scrollTo = (link: EditorHeadingLink) => {
    const currentEditor = editor.value;
    if (!currentEditor) return;

    const element = currentEditor.view.nodeDOM(link.position);
    if (!(element instanceof HTMLElement)) return;

    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  onBeforeUnmount(detach);

  return {
    links,
    scrollTo,
  };
};
