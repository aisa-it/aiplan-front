import { Node, mergeAttributes } from '@tiptap/core';
import { VueNodeViewRenderer } from '@tiptap/vue-3';
import MermaidNodeView from 'src/components/editorV2/components/MermaidNodeView.vue';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    mermaidBlock: {
      /** Вставить блок mermaid-диаграммы с шаблонным содержимым. */
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

/**
 * Блок mermaid-диаграммы.
 *
 * Контракт разметки зафиксирован санитайзером бэкенда (policy.go разрешает
 * class на pre) — ровно такой тег доезжает до базы без потерь:
 *
 *     <pre class="mermaid">flowchart TD; A --> B</pre>
 *
 * Хранится ТОЛЬКО исходный текст диаграммы; SVG рендерится на клиенте
 * в NodeView (см. mermaidRender.ts). data-атрибуты использовать нельзя —
 * санитайзер вырезает их на pre, поэтому маркер ноды — класс.
 */
export const MermaidBlock = Node.create({
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
        // Приоритет выше стандартных 50: обычный codeBlock матчит любой
        // pre, и без приоритета он перехватил бы наш блок при загрузке.
        priority: 1000,
        preserveWhitespace: 'full',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['pre', mergeAttributes(HTMLAttributes, { class: 'mermaid' }), 0];
  },

  addNodeView() {
    return VueNodeViewRenderer(MermaidNodeView);
  },

  addKeyboardShortcuts() {
    return {
      // Внутри блока Enter вставляет перенос строки (code: true),
      // выход из блока — Ctrl/Cmd+Enter, как у обычного код-блока.
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
