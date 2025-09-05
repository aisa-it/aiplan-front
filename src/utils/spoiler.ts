import { Node, mergeAttributes } from '@tiptap/core';
import { VueNodeViewRenderer } from '@tiptap/vue-3';
import SpoilerNodeView from 'src/components/SpoilerNodeView.vue';

export const Spoiler = Node.create({
  name: 'spoiler',

  group: 'block',
  content: 'block*',
  defining: true,

  addAttributes() {
    return {
      title: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-title') || '',
        renderHTML: (attributes) => ({
          'data-title': attributes.title,
        }),
      },
      collapsed: {
        default: true,
        parseHTML: (element) => element.hasAttribute('data-collapsed'),
        renderHTML: (attributes) => ({
          'data-collapsed': attributes.collapsed ? 'true' : 'false',
        }),
      },
      style: {
        default: null,
        parseHTML: (element) => element.getAttribute('style'),
        renderHTML: (attributes) => {
          if (!attributes.style) return {};
          return {
            style: attributes.style,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-spoiler]',
        getAttrs: (element) => ({
          title: element.getAttribute('data-title') || '',
          collapsed: element.hasAttribute('data-collapsed'),
          style: element.getAttribute('style'),
        }),
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes({ 'data-spoiler': '' }, HTMLAttributes), 0];
  },

  addCommands() {
    return {
      setSpoiler:
        (attributes) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: attributes || { title: '' },
            content: [
              {
                type: 'paragraph',
              },
            ],
          });
        },
    };
  },

  addNodeView() {
    return VueNodeViewRenderer(SpoilerNodeView);
  },
});
