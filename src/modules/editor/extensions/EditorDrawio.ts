import { Node, mergeAttributes } from '@tiptap/core';
import { VueNodeViewRenderer } from '@tiptap/vue-3';
import EditorImageNodeView from '../components/EditorImageNodeView.vue';
import placeholder from '../assets/start.drawio.png';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    editorDrawio: { insertDrawio: () => ReturnType };
  }
}

export const EditorDrawio = Node.create({
  name: 'drawio',
  group: 'inline',
  inline: true,
  atom: true,
  draggable: true,
  priority: 110,
  addAttributes() {
    return {
      src: {
        default: '',
        parseHTML: (element: HTMLElement) => element.getAttribute('src') || '',
      },
      xml: { default: '' },
      alt: { default: 'Диаграмма' },
      width: { default: null }, height: { default: null },
      style: { default: 'height: auto;' },
    };
  },
  parseHTML() {
    return [{ tag: 'img.drawio' }, { tag: 'img[data-drawio]' }];
  },
  addCommands() {
    return {
      insertDrawio: () => ({ commands }) => commands.insertContent({
        type: this.name,
        attrs: { src: placeholder, alt: 'Диаграмма', xml: '' },
      }),
    };
  },
  renderHTML({ HTMLAttributes }) {
    return ['img', mergeAttributes(HTMLAttributes, { class: 'drawio', 'data-drawio': 'true' })];
  },
  addNodeView() { return VueNodeViewRenderer(EditorImageNodeView); },
});
