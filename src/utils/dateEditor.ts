import { Node } from '@tiptap/core';
import { VueNodeViewRenderer } from '@tiptap/vue-3';
import DatePickerNodeView from 'src/components/DatePickerNodeView.vue';

export const DateNode = Node.create({
  name: 'date-node',

  group: 'inline',

  inline: true,

  selectable: true,

  atom: true,

  addAttributes() {
    return {
      date: {
        default: new Intl.DateTimeFormat('ru-RU').format(new Date()),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-type="date-node"]',
        getAttrs: (dom) => ({
          date: dom.getAttribute('data-date'),
        }),
      },
    ];
  },

  renderHTML({ node }) {
    return [
      'span',
      {
        'data-type': 'date-node',
        'data-date': node.attrs.date,
        class: 'date-node',
      },
      node.attrs.date,
    ];
  },

  addNodeView() {
    return VueNodeViewRenderer(DatePickerNodeView);
  },

  addCommands() {
    return {
      insertDate:
        (date = new Intl.DateTimeFormat('ru-RU').format(new Date())) =>
        ({ state, commands }) => {
          const { doc } = state;
          const isSingleDateNode = doc.content.size <= 2;

          const dateNode = {
            type: this.name,
            attrs: { date },
          };

          // 🟡 Определяем, мобильное ли устройство
          const isMobile =
            typeof navigator !== 'undefined' &&
            /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(
              navigator.userAgent,
            );

          const content = isMobile
            ? [dateNode, { type: 'text', text: ' ' }]
            : [dateNode];

          if (isSingleDateNode) {
            return commands.insertContent({
              type: 'paragraph',
              content: [{ type: 'text', text: '\u200B' }, ...content],
            });
          } else {
            return commands.insertContent(content);
          }
        },
    };
  },
});
