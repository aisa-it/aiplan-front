import { Extension } from '@tiptap/core';
import {
  DOMParser as ProseMirrorDOMParser,
  type Slice,
} from '@tiptap/pm/model';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { handlePaste as pasteTable } from '@tiptap/pm/tables';

import { normalizePastedHtml } from '../utils/normalizePastedHtml';

export const EditorPaste = Extension.create<{ allowImages: boolean }>({
  name: 'editorPaste',
  priority: 200,
  addOptions: () => ({ allowImages: true }),

  addProseMirrorPlugins() {
    const prepareHtml = (html: string) => {
      const normalized = normalizePastedHtml(html);
      if (this.options.allowImages) return normalized;
      const doc = new DOMParser().parseFromString(normalized, 'text/html');
      doc.querySelectorAll('img').forEach((image) => image.remove());
      return doc.body.innerHTML;
    };

    return [
      new Plugin({
        key: new PluginKey('editorPaste'),
        props: {
          transformPastedHTML: prepareHtml,
          handlePaste: (view, event, slice: Slice) => {
            const html = event.clipboardData?.getData('text/html') ?? '';
            if (!view.editable || !/<table(?:\s|>)/i.test(html)) return false;

            const { state } = view;
            const { $from } = state.selection;
            for (let depth = $from.depth; depth >= 0; depth--) {
              if ($from.node(depth).type.name !== 'table') continue;

              const tableStart = $from.before(depth);
              const firstRowIsHeader =
                $from.node(depth).firstChild?.firstChild?.type.name ===
                'tableHeader';
              if (!firstRowIsHeader || $from.index(depth) !== 0) return false;

              if (!pasteTable(view, event, slice)) return false;
              const table = view.state.doc.nodeAt(tableStart);
              const header = view.state.schema.nodes.tableHeader;
              if (table?.type.name === 'table' && header) {
                const tr = view.state.tr;
                table.firstChild?.forEach((cell, offset) => {
                  if (cell.type.name === 'tableCell')
                    tr.setNodeMarkup(
                      tableStart + 2 + offset,
                      header,
                      cell.attrs,
                    );
                });
                if (tr.docChanged) view.dispatch(tr);
              }
              event.preventDefault();
              return true;
            }
            if (
              $from.parent.type.name !== 'paragraph' ||
              $from.parent.content.size
            )
              return false;

            const container = document.createElement('div');
            container.innerHTML = prepareHtml(html);
            const doc = ProseMirrorDOMParser.fromSchema(state.schema).parse(
              container,
            );
            const tableSlice = doc.slice(0, doc.content.size);
            view.dispatch(
              state.tr.replace($from.before(), $from.after(), tableSlice),
            );
            event.preventDefault();
            return true;
          },
        },
      }),
    ];
  },
});
