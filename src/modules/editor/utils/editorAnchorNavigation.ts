import type { Editor } from '@tiptap/core';

export interface ParsedEditorAnchorLink {
  anchorId: string;
  workspaceSlug?: string;
  documentSlug?: string;
}

export interface ScrollEditorToAnchorOptions {
  behavior?: ScrollBehavior;
  focus?: boolean;
  highlight?: boolean;
}

export const parseEditorAnchorHref = (
  href: string,
  origin: string = window.location.origin,
): ParsedEditorAnchorLink | null => {
  try {
    const value = href.trim();
    const url = new URL(value, origin);
    if (!url.hash) return null;
    const anchorId = decodeURIComponent(url.hash.slice(1));
    if (!anchorId) return null;
    if (value.startsWith('#')) return { anchorId };

    const parts = url.pathname.split('/').filter(Boolean);
    if (parts.length !== 3 || parts[1] !== 'aidoc') return null;
    return {
      anchorId,
      workspaceSlug: decodeURIComponent(parts[0]),
      documentSlug: decodeURIComponent(parts[2]),
    };
  } catch {
    return null;
  }
};

export const scrollEditorToAnchor = (
  editor: Editor | null,
  anchorId: string,
  options: ScrollEditorToAnchorOptions = {},
): boolean => {
  if (!editor || !anchorId) return false;
  const root = editor.view.dom;
  const target = Array.from(
    root.querySelectorAll<HTMLElement>('[data-anchor-id], [id], [data-toc-id]'),
  ).find(
    (element) =>
      element.getAttribute('data-anchor-id') === anchorId ||
      element.id === anchorId ||
      element.getAttribute('data-toc-id') === anchorId,
  );
  if (!target) return false;

  if (options.focus) {
    try {
      editor
        .chain()
        .setTextSelection(editor.view.posAtDOM(target, 0))
        .focus()
        .run();
    } catch {}
  }

  const element =
    target.getBoundingClientRect().width &&
    target.getBoundingClientRect().height
      ? target
      : (target.closest<HTMLElement>('p, h1, h2, h3, h4, h5, h6, li') ??
        target);
  element.style.scrollMarginTop = '60px';
  element.scrollIntoView({
    behavior: options.behavior ?? 'smooth',
    block: 'start',
  });
  if (options.highlight !== false) {
    element.classList.add('editor-anchor-target--active');
    window.setTimeout(
      () => element.classList.remove('editor-anchor-target--active'),
      1600,
    );
  }
  return true;
};
