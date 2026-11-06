import type { Editor } from '@tiptap/core';
import { watch, type Ref } from 'vue';

const SCROLLBAR_HEIGHT = 16;
const VIEWPORT_GAP = 16;

function getVerticalScrollParent(element: HTMLElement): HTMLElement | null {
  for (
    let parent = element.parentElement;
    parent && parent !== document.body;
    parent = parent.parentElement
  ) {
    const overflow = getComputedStyle(parent).overflowY;
    if (
      /(auto|scroll|overlay)/.test(overflow) &&
      parent.scrollHeight > parent.clientHeight + 1
    ) {
      return parent;
    }
  }
  return null;
}

export function useEditorFloatingTableScroll(editor: Ref<Editor | null>) {
  watch(
    editor,
    (instance, _previous, onCleanup) => {
      if (!instance) return;

      const root = instance.view.dom;
      const floating = document.createElement('div');
      const track = document.createElement('div');
      const spacer = document.createElement('div');
      floating.className = 'editor-floating-table-scroll';
      floating.setAttribute('aria-label', 'Горизонтальная прокрутка таблицы');
      floating.style.cssText =
        'position:fixed;display:none;box-sizing:border-box;height:16px;padding-top:1px;z-index:2601;opacity:.75;pointer-events:none';
      track.style.cssText =
        'width:100%;height:15px;overflow-x:auto;overflow-y:hidden;pointer-events:auto';
      spacer.style.height = '1px';
      track.append(spacer);
      floating.append(track);
      document.body.append(floating);

      let active: HTMLElement | null = null;
      let frame = 0;
      let syncing = false;
      const observed = new Set<HTMLElement>();
      const resizeObserver = new ResizeObserver(() => schedule());

      const onTableScroll = () => {
        if (!active || syncing) return;
        syncing = true;
        track.scrollLeft = active.scrollLeft;
        requestAnimationFrame(() => {
          syncing = false;
        });
      };
      const onTrackScroll = () => {
        if (!active || syncing) return;
        syncing = true;
        active.scrollLeft = track.scrollLeft;
        requestAnimationFrame(() => {
          syncing = false;
        });
      };

      const refreshTables = () => {
        const tables = new Set(
          root.querySelectorAll<HTMLElement>('.tableWrapper'),
        );
        for (const table of observed) {
          if (tables.has(table)) continue;
          table.removeEventListener('scroll', onTableScroll);
          resizeObserver.unobserve(table);
          observed.delete(table);
        }
        for (const table of tables) {
          if (observed.has(table)) continue;
          observed.add(table);
          table.addEventListener('scroll', onTableScroll, { passive: true });
          resizeObserver.observe(table);
        }
        schedule();
      };

      const update = () => {
        if (window.innerWidth <= 768) {
          floating.style.display = 'none';
          active = null;
          return;
        }

        let selected: HTMLElement | null = null;
        let selectedRect: DOMRect | null = null;
        let selectedViewportBottom = 0;
        let largestVisibleHeight = 0;

        for (const table of observed) {
          if (table.scrollWidth <= table.clientWidth + 1) continue;
          const rect = table.getBoundingClientRect();
          const scrollParent = getVerticalScrollParent(table);
          const parentRect = scrollParent?.getBoundingClientRect();
          const viewportTop = Math.max(0, parentRect?.top ?? 0);
          const viewportBottom = Math.min(
            window.innerHeight,
            parentRect?.bottom ?? window.innerHeight,
          );
          const visibleHeight =
            Math.min(rect.bottom, viewportBottom) -
            Math.max(rect.top, viewportTop);
          if (
            visibleHeight < 32 ||
            rect.bottom <= viewportBottom ||
            rect.top >= viewportBottom - SCROLLBAR_HEIGHT ||
            rect.right <= 0 ||
            rect.left >= window.innerWidth ||
            visibleHeight <= largestVisibleHeight
          )
            continue;
          selected = table;
          selectedRect = rect;
          selectedViewportBottom = viewportBottom;
          largestVisibleHeight = visibleHeight;
        }

        if (!selected || !selectedRect) {
          floating.style.display = 'none';
          active = null;
          return;
        }

        const left = Math.max(0, selectedRect.left);
        const right = Math.min(window.innerWidth, selectedRect.right);
        active = selected;
        floating.style.display = '';
        floating.style.left = `${left}px`;
        floating.style.top = `${selectedViewportBottom - VIEWPORT_GAP - SCROLLBAR_HEIGHT}px`;
        floating.style.width = `${Math.max(0, right - left)}px`;
        floating.style.backgroundColor = getComputedStyle(
          root.closest<HTMLElement>('.editor-tiptap') ?? root,
        ).backgroundColor;
        spacer.style.width = `${selected.scrollWidth}px`;
        track.scrollLeft = selected.scrollLeft;
      };

      function schedule() {
        if (frame) return;
        frame = requestAnimationFrame(() => {
          frame = 0;
          update();
        });
      }

      track.addEventListener('scroll', onTrackScroll, { passive: true });
      window.addEventListener('scroll', schedule, {
        capture: true,
        passive: true,
      });
      window.addEventListener('resize', schedule, { passive: true });
      resizeObserver.observe(root);
      const mutationObserver = new MutationObserver(refreshTables);
      mutationObserver.observe(root, {
        childList: true,
        characterData: true,
        subtree: true,
      });
      refreshTables();

      onCleanup(() => {
        if (frame) cancelAnimationFrame(frame);
        mutationObserver.disconnect();
        resizeObserver.disconnect();
        window.removeEventListener('scroll', schedule, true);
        window.removeEventListener('resize', schedule);
        track.removeEventListener('scroll', onTrackScroll);
        for (const table of observed)
          table.removeEventListener('scroll', onTableScroll);
        floating.remove();
      });
    },
    { flush: 'post' },
  );
}
