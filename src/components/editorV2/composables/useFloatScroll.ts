import { Editor } from '@tiptap/vue-3';
import { Ref } from 'vue';

export function useFloatScroll(editor: Ref<Editor | null>) {
  let clearFloatScroll: null | (() => void) = null;

  function floatScroll() {
    if (clearFloatScroll) clearFloatScroll();

    if (!editor.value) return;

    const container = editor.value.view.dom as HTMLElement;
    const parent = container.parentElement as HTMLElement | null;
    if (!parent) return;

    container.classList.add('hide-scrollbar');

    if (parent.querySelector('.float-scroll')) return;

    const scrollbar = document.createElement('div');
    scrollbar.className = 'float-scroll';

    const scrollTrack = document.createElement('div');
    scrollTrack.className = 'float-scroll_track';

    const spacer = document.createElement('div');

    scrollTrack.appendChild(spacer);
    scrollbar.appendChild(scrollTrack);
    parent.appendChild(scrollbar);

    let raf = 0;
    let lock = false;
    let scrollContainer: HTMLElement | null = null;
    const OFFSET = 16;

    function getScrollContainer(el: HTMLElement): HTMLElement | null {
      let scrollContainer: HTMLElement | null = el;

      while (
        scrollContainer &&
        scrollContainer !== document.body &&
        scrollContainer !== document.documentElement
      ) {
        const style = getComputedStyle(scrollContainer);
        if (
          /(auto|scroll|overlay)/.test(style.overflowY) &&
          scrollContainer.scrollHeight > scrollContainer.clientHeight + 1
        ) {
          return scrollContainer;
        }
        scrollContainer = scrollContainer.parentElement;
      }

      return null;
    }

    function intersect(a: DOMRect, b: DOMRect) {
      const left = Math.max(a.left, b.left);
      const top = Math.max(a.top, b.top);
      const right = Math.min(a.right, b.right);
      const bottom = Math.min(a.bottom, b.bottom);
      return {
        left,
        top,
        right,
        bottom,
        width: Math.max(0, right - left),
        height: Math.max(0, bottom - top),
      };
    }

    const rafUpdatePos = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        updatePos();
      });
    };

    const setScrollContainer = (container: HTMLElement | null) => {
      if (scrollContainer === container) return;

      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', rafUpdatePos);
      }

      scrollContainer = container;

      if (scrollContainer) {
        scrollContainer.addEventListener('scroll', rafUpdatePos, {
          passive: true,
        });
      }
    };

    const updatePos = () => {
      setScrollContainer(getScrollContainer(parent));
      const parentRect = parent.getBoundingClientRect();
      const scrollbarOH = scrollbar.offsetHeight || 0;

      const windowRect = new DOMRect(
        0,
        0,
        window.innerWidth,
        window.innerHeight,
      );
      const scrollContainerRect = scrollContainer?.getBoundingClientRect();
      const viewRect = scrollContainer
        ? intersect(windowRect, scrollContainer.getBoundingClientRect())
        : {
            left: 0,
            top: 0,
            right: window.innerWidth,
            bottom: window.innerHeight,
            width: window.innerWidth,
            height: window.innerHeight,
          };

      const isVisible = scrollContainer
        ? parentRect.bottom > scrollContainerRect!.top &&
          parentRect.top < scrollContainerRect!.bottom &&
          scrollContainerRect!.bottom > 0 &&
          scrollContainerRect!.top < window.innerHeight
        : parentRect.bottom > 0 && parentRect.top < window.innerHeight;

      scrollbar.style.display = isVisible ? '' : 'none';
      if (!isVisible) return;

      scrollbar.style.width = `${Math.max(0, parentRect.width)}px`;

      const base = viewRect.bottom - OFFSET;

      const min = parentRect.top + scrollbarOH;
      const max = parentRect.bottom;
      const clamp = Math.min(Math.max(base, min), max);
      const fixed = window.innerHeight - OFFSET;
      const translateY = clamp - fixed;
      const reachedBottom = clamp >= max - 1;
      const reachedTop = clamp <= min + 1;
      if (reachedBottom) {
        scrollbar.style.position = 'absolute';
        scrollbar.style.top = '';
        scrollbar.style.bottom = '0px';
        scrollbar.style.transform = '';
        scrollbar.style.left = '0';
        scrollbar.style.right = '0';
      } else if (reachedTop) {
        scrollbar.style.position = 'absolute';
        scrollbar.style.bottom = '';
        scrollbar.style.top = '0px';
        scrollbar.style.transform = '';
        scrollbar.style.left = '0';
        scrollbar.style.right = '0';
      } else {
        scrollbar.style.position = 'fixed';
        scrollbar.style.top = '';
        scrollbar.style.left = '';
        scrollbar.style.right = '';
        scrollbar.style.bottom = `${OFFSET}px`;
        scrollbar.style.transform = translateY
          ? `translateY(${translateY}px)`
          : '';
      }
    };

    const updateWidth = () => {
      spacer.style.width = `${container.scrollWidth}px`;

      if (!lock) {
        lock = true;
        scrollTrack.scrollLeft = container.scrollLeft;
        requestAnimationFrame(() => (lock = false));
      }

      rafUpdatePos();
    };

    const onTrackScroll = () => {
      if (lock) return;
      lock = true;
      container.scrollLeft = scrollTrack.scrollLeft;
      requestAnimationFrame(() => (lock = false));
    };

    const onContainerScroll = () => {
      if (lock) return;
      lock = true;
      scrollTrack.scrollLeft = container.scrollLeft;
      requestAnimationFrame(() => (lock = false));
    };

    scrollTrack.addEventListener('scroll', onTrackScroll, { passive: true });
    container.addEventListener('scroll', onContainerScroll, { passive: true });

    window.addEventListener('scroll', rafUpdatePos, { passive: true });
    window.addEventListener('resize', rafUpdatePos, { passive: true });

    const resizeObserver = new ResizeObserver(() => {
      updateWidth();
    });

    resizeObserver.observe(container);

    updateWidth();
    rafUpdatePos();

    clearFloatScroll = () => {
      if (raf) cancelAnimationFrame(raf);

      scrollTrack.removeEventListener('scroll', onTrackScroll);
      container.removeEventListener('scroll', onContainerScroll);

      window.removeEventListener('scroll', rafUpdatePos);
      window.removeEventListener('resize', rafUpdatePos);

      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', rafUpdatePos);
      }

      resizeObserver.disconnect();
      scrollbar.remove();
      clearFloatScroll = null;
    };
  }

  return {
    floatScroll,
    clearFloatScroll: () => clearFloatScroll?.(),
  };
}
