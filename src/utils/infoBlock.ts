import { Node, mergeAttributes } from '@tiptap/core';
import { VueNodeViewRenderer } from '@tiptap/vue-3';
import InfoBlockNodeView from 'src/components/InfoBlockNodeView.vue';

export const InfoBlock = Node.create({
  name: 'info-block',

  group: 'block',
  content: 'block*',
  defining: true,

  addAttributes() {
    return {
      title: {
        default: 'Информация',
        parseHTML: (element) =>
          element.getAttribute('data-title') || 'Информация',
        renderHTML: (attributes) => ({
          'data-title': attributes.title,
        }),
      },
      icon: {
        default: 'infoIcon',
        parseHTML: (element) => element.getAttribute('data-icon') || 'infoIcon',
        renderHTML: (attributes) => ({
          'data-icon': attributes.icon,
        }),
      },
      iconColor: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-icon-color') || '',
        renderHTML: (attributes) => ({
          'data-icon-color': attributes.iconColor,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-info-block]',
        getAttrs: (element) => ({
          title: element.getAttribute('data-title') || 'Информация',
          icon: element.getAttribute('data-icon') || 'infoIcon',
          iconColor: element.getAttribute('data-icon-color') || '',
        }),
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes({ 'data-info-block': '' }, HTMLAttributes),
      0,
    ];
  },

  // @ts-expect-error: Tiptap custom command type mismatch is expected here
  addCommands() {
    return {
      setInfoBlock:
        (attributes: any) =>
        ({ commands }: { commands: any }) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              title: attributes?.title || 'Информация',
              icon: attributes?.icon || 'infoIcon',
              iconColor: attributes?.iconColor || '',
            },
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
    return VueNodeViewRenderer(InfoBlockNodeView);
  },
});
