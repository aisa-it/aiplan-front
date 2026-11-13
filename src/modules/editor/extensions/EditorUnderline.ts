import Underline from '@tiptap/extension-underline';

export const EditorUnderline = Underline.extend({
  parseHTML() {
    return [...(this.parent?.() ?? []), { tag: 'ins' }];
  },
});
