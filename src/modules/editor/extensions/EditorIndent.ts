import { Extension } from '@tiptap/core';
import type { CommandProps } from '@tiptap/core';
import type { Node as ProseMirrorNode } from '@tiptap/pm/model';

interface EditorIndentOptions {
  types: string[];
  minLevel: number;
  maxLevel: number;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    editorIndent: {
      increaseBlockIndent: () => ReturnType;
      decreaseBlockIndent: () => ReturnType;
    };
  }
}

const INDENT_CLASS_PREFIX = 'tt-indent-';

export const EditorIndent = Extension.create<EditorIndentOptions>({
  name: 'editorIndent',

  addOptions() {
    return {
      types: ['paragraph', 'heading'],
      minLevel: 0,
      maxLevel: 8,
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          indent: {
            default: null,
            parseHTML: (element) => {
              const indentClass = Array.from(element.classList).find((name) =>
                name.startsWith(INDENT_CLASS_PREFIX),
              );

              if (!indentClass) return null;

              const level = Number(indentClass.slice(INDENT_CLASS_PREFIX.length));
              return level > this.options.minLevel ? level : null;
            },
            renderHTML: ({ indent }) =>
              indent > this.options.minLevel
                ? { class: `${INDENT_CLASS_PREFIX}${indent}` }
                : {},
          },
        },
      },
    ];
  },

  addCommands() {
    const changeIndent =
      (delta: number) =>
      () =>
      ({ state, dispatch }: CommandProps) => {
        const positions = new Set<number>();
        const { selection } = state;

        if (selection.empty) {
          for (let depth = selection.$from.depth; depth > 0; depth -= 1) {
            const node = selection.$from.node(depth);

            if (this.options.types.includes(node.type.name)) {
              positions.add(selection.$from.before(depth));
              break;
            }
          }
        } else {
          state.doc.nodesBetween(
            selection.from,
            selection.to,
            (node: ProseMirrorNode, pos: number) => {
              if (!this.options.types.includes(node.type.name)) return true;

              positions.add(pos);
              return false;
            },
          );
        }

        if (!positions.size) return false;

        const transaction = state.tr;
        let changed = false;

        positions.forEach((pos) => {
          const node = transaction.doc.nodeAt(pos);
          if (!node) return;

          const currentLevel = Number(node.attrs.indent ?? 0);
          const nextLevel = Math.min(
            this.options.maxLevel,
            Math.max(this.options.minLevel, currentLevel + delta),
          );

          if (nextLevel === currentLevel) return;

          transaction.setNodeMarkup(pos, node.type, {
            ...node.attrs,
            indent: nextLevel > this.options.minLevel ? nextLevel : null,
          });
          changed = true;
        });

        if (changed) dispatch?.(transaction);
        return changed;
      };

    return {
      increaseBlockIndent: changeIndent(1),
      decreaseBlockIndent: changeIndent(-1),
    };
  },

  addKeyboardShortcuts() {
    return {
      Backspace: () => {
        const { empty, $from } = this.editor.state.selection;
        const indent = Number($from.parent.attrs.indent ?? 0);

        if (!empty || $from.parentOffset !== 0 || indent <= 0) return false;
        return this.editor.commands.decreaseBlockIndent();
      },
    };
  },
});
