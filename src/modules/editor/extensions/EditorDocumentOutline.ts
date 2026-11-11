import { Node } from '@tiptap/core';
import { VueNodeViewRenderer } from '@tiptap/vue-3';

import EditorDocumentOutlineNodeView from '../components/EditorDocumentOutlineNodeView.vue';
import { collectEditorHeadingLinks } from '../utils/editorHeadingLinks';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    documentOutline: {
      insertDocumentOutline: () => ReturnType;
    };
  }
}

export const EditorDocumentOutline = Node.create({
  name: 'heading-links',
  group: 'block',
  content: 'block*',
  defining: true,
  draggable: true,

  addAttributes() {
    return {
      links: {
        default: null,
        parseHTML: (element: HTMLElement) => element.getAttribute('data-links'),
        renderHTML: ({ links }: { links: string | null }) =>
          links === null ? {} : { 'data-links': links },
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-heading-links]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', { 'data-heading-links': '', ...HTMLAttributes }, 0];
  },

  addCommands() {
    return {
      insertDocumentOutline: () => ({ commands, tr }) => {
        const links = collectEditorHeadingLinks(tr);
        return commands.insertContent({
          type: this.name,
          attrs: { links: JSON.stringify(links) },
          content: [{ type: 'paragraph' }],
        });
      },
    };
  },

  addNodeView() {
    return VueNodeViewRenderer(EditorDocumentOutlineNodeView);
  },
});
