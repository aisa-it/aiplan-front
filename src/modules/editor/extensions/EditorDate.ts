import { Node } from '@tiptap/core';
import { VueNodeViewRenderer } from '@tiptap/vue-3';

import EditorDateNodeView from '../components/EditorDateNodeView.vue';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    editorDate: {
      insertDate: (date?: string) => ReturnType;
    };
  }
}

const getCurrentDate = () => new Intl.DateTimeFormat('ru-RU').format(new Date());

export const EditorDate = Node.create({
  name: 'date-node',
  group: 'inline',
  inline: true,
  selectable: true,
  atom: true,

  addAttributes() {
    return {
      date: {
        default: getCurrentDate(),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-type="date-node"]',
        getAttrs: (element) => ({
          date: element.getAttribute('data-date') || element.textContent?.trim() || getCurrentDate(),
        }),
      },
    ];
  },

  renderHTML({ node }) {
    return [
      'span',
      {
        'data-type': this.name,
        'data-date': node.attrs.date,
        class: this.name,
      },
      node.attrs.date,
    ];
  },

  addCommands() {
    return {
      insertDate:
        (date = getCurrentDate()) =>
        ({ commands }) =>
          commands.insertContent({
            type: this.name,
            attrs: { date },
          }),
    };
  },

  addNodeView() {
    return VueNodeViewRenderer(EditorDateNodeView);
  },
});
