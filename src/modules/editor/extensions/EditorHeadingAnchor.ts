import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import type { EditorState, Transaction } from '@tiptap/pm/state';
import {
  collectAnchorIds,
  isValidAnchorSlug,
  makeUniqueSlug,
} from '../utils/editorAnchorSlug';

const HEADING_TYPE = 'heading';

const headingAnchorPluginKey = new PluginKey('headingAnchor');

interface PendingHeadingId {
  pos: number;
  attrs: Record<string, unknown>;
}

const buildHeadingIdTransaction = (
  state: EditorState,
  skipSelectedHeading: boolean,
): Transaction | null => {
  const { from, to } = state.selection;

  const candidates: { pos: number; text: string }[] = [];

  state.doc.descendants((node, pos) => {
    if (node.type.name !== HEADING_TYPE) return true;

    if (node.attrs.anchorId) return false;

    const text = node.textContent.trim();
    if (!text) return false;

    if (skipSelectedHeading && from <= pos + node.nodeSize && to >= pos) {
      return false;
    }

    candidates.push({ pos, text });
    return false;
  });

  if (!candidates.length) return null;

  const taken = collectAnchorIds(state.doc);
  const updates: PendingHeadingId[] = [];

  for (const candidate of candidates) {
    const node = state.doc.nodeAt(candidate.pos);
    if (!node) continue;

    const anchorId = makeUniqueSlug(candidate.text, taken);

    taken.add(anchorId);
    updates.push({ pos: candidate.pos, attrs: { ...node.attrs, anchorId } });
  }

  if (!updates.length) return null;

  const tr = state.tr;
  for (const update of updates) {
    tr.setNodeMarkup(update.pos, undefined, update.attrs);
  }

  tr.setMeta('addToHistory', false);

  return tr;
};

export const HeadingWithAnchor = Extension.create({
  name: 'headingAnchor',

  addGlobalAttributes() {
    return [
      {
        types: [HEADING_TYPE],
        attributes: {
          anchorId: {
            default: null,
            parseHTML: (element) => {
              const id = element.getAttribute('data-anchor-id');

              return isValidAnchorSlug(id) ? id : null;
            },
            renderHTML: (attributes) => {
              if (!attributes.anchorId) return {};
              return { 'data-anchor-id': attributes.anchorId };
            },
          },
        },
      },
    ];
  },

  onCreate() {
    const { state, view } = this.editor;
    const tr = buildHeadingIdTransaction(state, false);
    if (tr) view.dispatch(tr);
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: headingAnchorPluginKey,

        appendTransaction: (transactions, oldState, newState) => {
          const docChanged = transactions.some(
            (transaction) => transaction.docChanged,
          );
          const selectionMoved = !oldState.selection.eq(newState.selection);

          if (!docChanged && !selectionMoved) return null;

          const editor = this.editor;
          const skipSelectedHeading = Boolean(
            editor?.isEditable && editor?.isFocused,
          );

          return buildHeadingIdTransaction(newState, skipSelectedHeading);
        },
      }),
    ];
  },
});
