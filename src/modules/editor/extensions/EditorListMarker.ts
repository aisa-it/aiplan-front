import { Extension } from '@tiptap/core';
import { Plugin } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

export const EditorListMarker = Extension.create({
  name: 'editorListMarker',
  addProseMirrorPlugins() {
    return [
      new Plugin({
        props: {
          decorations(state) {
            const decorations: Decoration[] = [];
            state.doc.descendants((node, position) => {
              if (node.type.name !== 'listItem') return;
              const text = node.firstChild?.firstChild;
              const mark = text?.marks.find(
                (item) => item.type.name === 'textStyle',
              );
              if (!mark) return;
              const color = mark.attrs.color as string | undefined;
              const fontSize = mark.attrs.fontSize as string | undefined;
              const style = [
                color && `color: ${color}`,
                fontSize && `font-size: ${fontSize}`,
              ]
                .filter(Boolean)
                .join('; ');
              if (style) {
                decorations.push(
                  Decoration.node(position, position + node.nodeSize, {
                    style,
                  }),
                );
              }
            });
            return DecorationSet.create(state.doc, decorations);
          },
        },
      }),
    ];
  },
});
