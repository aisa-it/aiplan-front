import { onUnmounted } from 'vue';

export function useStickyState(selector: string) {
  let element: HTMLElement | null = null;
  let scrollHandler: (() => void) | null = null;
  let observer: MutationObserver | null = null;

  const checkSticky = () => {
    if (!element || !document.body.contains(element)) {
      initSticky();
      return;
    }

    const rect = element.getBoundingClientRect();
    const computedStyle = window.getComputedStyle(element);
    const stickyTop = parseFloat(computedStyle.top) || 0;
    
    const isSticky = Math.abs(rect.top - stickyTop) < 2;

    if (isSticky) {
      element.classList.add('is-sticky');
    } else {
      element.classList.remove('is-sticky');
    }
  };

  const cleanup = () => {
    if (scrollHandler) {
      window.removeEventListener('scroll', scrollHandler);
      scrollHandler = null;
    }
    element = null;
  };

  const initSticky = () => {
    const foundElement = document.querySelector(selector) as HTMLElement;
    
    if (foundElement && foundElement !== element) {
      cleanup();
      element = foundElement;
      scrollHandler = () => checkSticky();
      window.addEventListener('scroll', scrollHandler, { passive: true });
      checkSticky();
    } else if (!foundElement && element) {
      cleanup();
    }
  };

  observer = new MutationObserver(() => {
    if (!element || !document.body.contains(element)) {
      initSticky();
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  initSticky();

  onUnmounted(() => {
    cleanup();
    if (observer) observer.disconnect();
  });
}

