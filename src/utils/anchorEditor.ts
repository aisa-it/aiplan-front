import { Node, mergeAttributes } from '@tiptap/core';
import { VueNodeViewRenderer } from '@tiptap/vue-3';
import AnchorNodeView from 'src/components/editorV2/components/AnchorNodeView.vue';
import { isValidAnchorSlug } from 'src/utils/anchorSlug';

export interface DocAnchorAttributes {
  /** Постоянный идентификатор якоря — то, что стоит после `#` в ссылке. */
  anchorId: string;
  /** Человеческое название: показывается в редакторе и в списке целей. */
  title?: string | null;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    docAnchor: {
      /** Вставить якорь в позицию курсора. */
      setDocAnchor: (attributes: DocAnchorAttributes) => ReturnType;
      /** Обновить атрибуты якоря под курсором (на деле — только название). */
      updateDocAnchor: (attributes: Partial<DocAnchorAttributes>) => ReturnType;
      /** Удалить якорь под курсором. */
      unsetDocAnchor: () => ReturnType;
    };
  }
}

/**
 * Якорь внутри документа АИДока.
 *
 * Контракт разметки зафиксирован санитайзером бэкенда — ровно такой span
 * доезжает до базы без потерь:
 *
 *     <span class="doc-anchor" data-anchor-id="vvedenie" data-anchor-title="Введение"></span>
 *
 * Нода атомарная и пустая: содержимого у неё нет вовсе, поэтому в renderHTML
 * НЕ должно быть дырки (`0`) — иначе ProseMirror ждал бы контент, а при
 * повторном разборе такого span'а нода бы потерялась.
 */
export const DocAnchor = Node.create({
  name: 'docAnchor',

  inline: true,
  group: 'inline',
  atom: true,
  selectable: true,
  draggable: false,

  addAttributes() {
    return {
      anchorId: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-anchor-id'),
        renderHTML: (attributes) => {
          if (!attributes.anchorId) return {};
          return { 'data-anchor-id': attributes.anchorId };
        },
      },
      title: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-anchor-title'),
        renderHTML: (attributes) => {
          if (!attributes.title) return {};
          return { 'data-anchor-title': attributes.title };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-anchor-id]',
        // Приоритет выше стандартных 50: пустой span легко перехватывают
        // общие правила разбора (тот же TextStyle со своим `span`).
        priority: 1000,
        getAttrs: (element) => {
          const anchorId = (element as HTMLElement).getAttribute(
            'data-anchor-id',
          );

          // Слаг, который не переживёт санитайзер, якорем не считаем:
          // ссылка на него всё равно никуда бы не привела.
          return isValidAnchorSlug(anchorId) ? null : false;
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes({ class: 'doc-anchor' }, HTMLAttributes)];
  },

  addNodeView() {
    return VueNodeViewRenderer(AnchorNodeView);
  },

  addCommands() {
    return {
      setDocAnchor:
        (attributes) =>
        ({ commands }) =>
          commands.insertContent({
            type: this.name,
            attrs: {
              anchorId: attributes.anchorId,
              title: attributes.title ?? null,
            },
          }),

      updateDocAnchor:
        (attributes) =>
        ({ commands }) =>
          commands.updateAttributes(this.name, attributes),

      unsetDocAnchor:
        () =>
        ({ commands }) =>
          commands.deleteNode(this.name),
    };
  },
});
