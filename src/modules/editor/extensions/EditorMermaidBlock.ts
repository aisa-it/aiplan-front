import { Node, mergeAttributes } from '@tiptap/core';
import { VueNodeViewRenderer } from '@tiptap/vue-3';
import EditorMermaidNodeView from '../components/EditorMermaidNodeView.vue';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    mermaidBlock: {
      insertMermaid: () => ReturnType;
    };
  }
}

const DEFAULT_DIAGRAM = [
  'flowchart TD',
  '    A[Начало] --> B{Условие}',
  '    B -->|Да| C[Действие]',
  '    B -->|Нет| D[Конец]',
].join('\n');

export const EditorMermaidBlock = Node.create({
  name: 'mermaidBlock',

  group: 'block',
  content: 'text*',
  marks: '',
  code: true,
  defining: true,

  parseHTML() {
    return [
      {
        tag: 'pre.mermaid',
        priority: 1000,
        preserveWhitespace: 'full',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['pre', mergeAttributes(HTMLAttributes, { class: 'mermaid' }), 0];
  },

  addNodeView() {
    return VueNodeViewRenderer(EditorMermaidNodeView);
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Enter': () => this.editor.commands.exitCode(),
    };
  },

  addCommands() {
    return {
      insertMermaid:
        () =>
        ({ commands }) =>
          commands.insertContent({
            type: this.name,
            content: [{ type: 'text', text: DEFAULT_DIAGRAM }],
          }),
    };
  },
});
