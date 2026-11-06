import { mergeAttributes, Node } from '@tiptap/core';
import { VueNodeViewRenderer } from '@tiptap/vue-3';

import EditorSpoilerNodeView from '../components/EditorSpoilerNodeView.vue';

export interface EditorSpoilerAttributes {
  title?: string;
  collapsed?: boolean;
  style?: string;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    editorSpoiler: {
      setSpoiler: (attributes?: EditorSpoilerAttributes) => ReturnType;
    };
  }
}

export const EditorSpoiler = Node.create({
  name: 'spoiler',
  group: 'block',
  content: 'block*',
  defining: true,

  addAttributes() {
    return {
      title: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-title') || '',
        renderHTML: ({ title }) => ({ 'data-title': title }),
      },
      collapsed: {
        default: true,
        parseHTML: (element) => element.hasAttribute('data-collapsed'),
        renderHTML: ({ collapsed }) =>
          ({ 'data-collapsed': collapsed ? 'true' : 'false' }),
      },
      style: {
        default: null,
        parseHTML: (element) => element.getAttribute('style'),
        renderHTML: ({ style }) => (style ? { style } : {}),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-spoiler]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes({ 'data-spoiler': '' }, HTMLAttributes),
      0,
    ];
  },

  addCommands() {
    return {
      setSpoiler:
        (attributes = {}) =>
        ({ commands }) =>
          commands.insertContent({
            type: this.name,
            attrs: attributes,
            content: [{ type: 'paragraph' }],
          }),
    };
  },

  addNodeView() {
    return VueNodeViewRenderer(EditorSpoilerNodeView);
  },
});
