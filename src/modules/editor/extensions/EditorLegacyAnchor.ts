import { Node, mergeAttributes } from '@tiptap/core';
import { VueNodeViewRenderer } from '@tiptap/vue-3';
import EditorAnchorNodeView from '../components/EditorAnchorNodeView.vue';
import { isValidAnchorSlug } from '../utils/editorAnchorSlug';

export interface DocAnchorAttributes {
  anchorId: string;
  title?: string | null;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    docAnchor: {
      setDocAnchor: (attributes: DocAnchorAttributes) => ReturnType;
      updateDocAnchor: (attributes: Partial<DocAnchorAttributes>) => ReturnType;
      unsetDocAnchor: () => ReturnType;
    };
  }
}

export const EditorLegacyAnchor = Node.create({
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
        priority: 1000,
        getAttrs: (element) => {
          const anchorId = (element as HTMLElement).getAttribute(
            'data-anchor-id',
          );

          return isValidAnchorSlug(anchorId) ? null : false;
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes({ class: 'doc-anchor' }, HTMLAttributes)];
  },

  addNodeView() {
    return VueNodeViewRenderer(EditorAnchorNodeView);
  },

  addCommands() {
    return {
      setDocAnchor:
        (attributes) =>
        ({ tr, dispatch }) => {
          const node = tr.doc.type.schema.nodes[this.name]?.create({
            anchorId: attributes.anchorId,
            title: attributes.title ?? null,
          });
          if (!node) return false;
          if (dispatch) dispatch(tr.replaceSelectionWith(node));
          return true;
        },

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
