import type { Transaction } from '@tiptap/pm/state';

export interface SavedHeadingLink {
  id: string;
  anchorId?: string | null;
  text: string;
  index: string;
  level: number;
  originalLevel: number;
}

export const collectEditorHeadingLinks = (
  tr: Transaction,
): SavedHeadingLink[] => {
  const used = new Set<string>();
  tr.doc.descendants((node) => {
    if (typeof node.attrs.id === 'string' && node.attrs.id)
      used.add(node.attrs.id);
  });
  const counters = Array<number>(6).fill(0);
  const links: SavedHeadingLink[] = [];
  tr.doc.descendants((node, position) => {
    if (node.type.name !== 'heading') return;
    const level = Number(node.attrs.level);
    counters[level - 1] += 1;
    counters.fill(0, level);
    let id = node.attrs.id as string | null;
    if (!id) {
      const base = `editor-heading-${position}`;
      id = base;
      for (let suffix = 2; used.has(id); suffix += 1) id = `${base}-${suffix}`;
      used.add(id);
      tr.setNodeMarkup(position, undefined, { ...node.attrs, id });
    }
    links.push({
      id,
      anchorId: node.attrs.anchorId || null,
      text: node.textContent,
      index: `${counters
        .slice(0, level)
        .map((value) => value || 1)
        .join('.')}.`,
      level,
      originalLevel: level,
    });
  });
  return links;
};
