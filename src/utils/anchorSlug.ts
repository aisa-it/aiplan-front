import CyrillicToTranslit from 'cyrillic-to-translit-js';
import type { Node as ProseMirrorNode } from '@tiptap/pm/model';

const cyrillicToTranslit = CyrillicToTranslit();

// Слаг должен пережить санитайзер на бэкенде: там для атрибутов id и
// data-anchor-id стоит якорный regexp ^[a-z0-9][a-z0-9_-]{0,63}$.
// Всё, что в него не влезает, будет молча вырезано при сохранении документа.
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

/**
 * Превращает произвольный текст в ASCII-слаг.
 * Кириллица транслитерируется тем же пакетом, что и слаги пространств,
 * чтобы «Введение» одинаково выглядело во всех частях продукта.
 */
export const slugify = (text: string): string => {
  const slug = cyrillicToTranslit
    .transform(String(text ?? ''))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, MAX_SLUG_LENGTH)
    // Обрезка по длине могла оставить дефис на конце.
    .replace(/-+$/g, '');

  // Слаг обязан начинаться с буквы или цифры: строка из одних спецсимволов
  // после чистки станет пустой, а «123» — валиден и остаётся как есть.
  return ANCHOR_SLUG_PATTERN.test(slug) ? slug : FALLBACK_SLUG;
};

/**
 * Дополняет слаг числовым суффиксом, пока он не станет уникальным.
 * taken — уже занятые в документе идентификаторы.
 */
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

/**
 * Все занятые идентификаторы документа: и явные якоря, и id заголовков.
 * Оба вида живут в одном пространстве имён — ссылка `#foo` не должна
 * попадать сразу в два разных места.
 */
export const collectAnchorIds = (doc: ProseMirrorNode): Set<string> => {
  const ids = new Set<string>();

  doc.descendants((node) => {
    if (node.type.name === 'docAnchor' && node.attrs.anchorId) {
      ids.add(node.attrs.anchorId);
    }
    // У заголовка тоже data-anchor-id, а не id: атрибут id занят
    // расширением оглавления (см. headingAnchor.ts).
    if (node.type.name === 'heading' && node.attrs.anchorId) {
      ids.add(node.attrs.anchorId);
    }
    return true;
  });

  return ids;
};

/**
 * Список целей для выпадашки «вставить ссылку на якорь»: сначала явные
 * якоря и заголовки идут в порядке появления в документе.
 */
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
