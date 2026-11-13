import CyrillicToTranslit from 'cyrillic-to-translit-js';
import type { Node as ProseMirrorNode } from '@tiptap/pm/model';

const cyrillicToTranslit = CyrillicToTranslit();

export const ANCHOR_SLUG_PATTERN = /^[a-z0-9][a-z0-9_-]{0,63}$/;

const MAX_SLUG_LENGTH = 64;
const FALLBACK_SLUG = 'anchor';

export interface AnchorTarget {
  id: string;
  label: string;
  type: 'anchor' | 'heading';
  level?: number;
}

export const isValidAnchorSlug = (value: unknown): value is string =>
  typeof value === 'string' && ANCHOR_SLUG_PATTERN.test(value);

export const slugify = (text: string): string => {
  const slug = cyrillicToTranslit
    .transform(String(text ?? ''))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, MAX_SLUG_LENGTH)
    .replace(/-+$/g, '');

  return ANCHOR_SLUG_PATTERN.test(slug) ? slug : FALLBACK_SLUG;
};

export const makeUniqueSlug = (base: string, taken: Set<string>): string => {
  const slug = slugify(base);
  if (!taken.has(slug)) return slug;

  for (let i = 2; ; i++) {
    const suffix = `-${i}`;
    const candidate =
      slug.slice(0, MAX_SLUG_LENGTH - suffix.length).replace(/-+$/g, '') +
      suffix;
    if (!taken.has(candidate)) return candidate;
  }
};

export const collectAnchorIds = (doc: ProseMirrorNode): Set<string> => {
  const ids = new Set<string>();

  doc.descendants((node) => {
    if (node.type.name === 'docAnchor' && node.attrs.anchorId) {
      ids.add(node.attrs.anchorId);
    }
    if (node.type.name === 'heading' && node.attrs.anchorId) {
      ids.add(node.attrs.anchorId);
    }
    return true;
  });

  return ids;
};

export const collectAnchorTargets = (doc: ProseMirrorNode): AnchorTarget[] => {
  const targets: AnchorTarget[] = [];

  doc.descendants((node) => {
    if (node.type.name === 'docAnchor' && node.attrs.anchorId) {
      targets.push({
        id: node.attrs.anchorId,
        label: node.attrs.title || node.attrs.anchorId,
        type: 'anchor',
      });
    }

    if (node.type.name === 'heading' && node.attrs.anchorId) {
      const text = node.textContent.trim();
      targets.push({
        id: node.attrs.anchorId,
        label: text || node.attrs.anchorId,
        type: 'heading',
        level: node.attrs.level,
      });
    }

    return true;
  });

  return targets;
};
