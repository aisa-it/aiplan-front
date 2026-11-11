import { i18n } from '@/i18n';
import { mergeAttributes, Node } from '@tiptap/core';
import { VueNodeViewRenderer } from '@tiptap/vue-3';

import EditorInfoBlockNodeView from '../components/EditorInfoBlockNodeView.vue';

export interface EditorInfoBlockAttributes {
  title?: string;
  icon?: string;
  iconColor?: string;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    editorInfoBlock: {
      setInfoBlock: (attributes?: EditorInfoBlockAttributes) => ReturnType;
    };
  }
}

export const EditorInfoBlock = Node.create({
  name: 'info-block',
  group: 'block',
  content: 'block*',
  defining: true,

  addAttributes() {
    return {
      title: {
        default: i18n.global.t('editor.information'),
        parseHTML: (element) =>
          element.getAttribute('data-title') ?? i18n.global.t('editor.information'),
        renderHTML: ({ title }) => ({ 'data-title': title }),
      },
      icon: {
        default: 'infoIcon',
        parseHTML: (element) => element.getAttribute('data-icon') || 'infoIcon',
        renderHTML: ({ icon }) => ({ 'data-icon': icon }),
      },
      iconColor: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-icon-color') || '',
        renderHTML: ({ iconColor }) => ({ 'data-icon-color': iconColor }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-info-block]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes({ 'data-info-block': '' }, HTMLAttributes),
      0,
    ];
  },

  addCommands() {
    return {
      setInfoBlock:
        (attributes = {}) =>
        ({ commands }) =>
          commands.insertContent({
            type: this.name,
            attrs: {
              title: attributes.title ?? i18n.global.t('editor.information'),
              icon: attributes.icon || 'infoIcon',
              iconColor: attributes.iconColor || '',
            },
            content: [{ type: 'paragraph' }],
          }),
    };
  },

  addNodeView() {
    return VueNodeViewRenderer(EditorInfoBlockNodeView);
  },
});
