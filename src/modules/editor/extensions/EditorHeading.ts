import Heading from '@tiptap/extension-heading';

export const EditorHeading = Heading.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      id: {
        default: null,
        parseHTML: (element: HTMLElement) => element.getAttribute('id'),
        renderHTML: ({ id }: { id: string | null }) => (id ? { id } : {}),
      },
    };
  },
});
