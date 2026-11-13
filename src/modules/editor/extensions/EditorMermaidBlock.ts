import { i18n } from '@/i18n';
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

const getDefaultDiagram = () =>
  [
    'flowchart TD',
    `    A[${i18n.global.t('editor.mermaidStart')}] --> B{${i18n.global.t('editor.mermaidCondition')}}`,
    `    B -->|${i18n.global.t('editor.mermaidYes')}| C[${i18n.global.t('editor.mermaidAction')}]`,
    `    B -->|${i18n.global.t('editor.mermaidNo')}| D[${i18n.global.t('editor.mermaidEnd')}]`,
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
            content: [{ type: 'text', text: getDefaultDiagram() }],
          }),
    };
  },
});
