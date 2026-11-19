import { nextTick, onBeforeUnmount, onMounted, ref, watch, type Ref } from 'vue';

interface HorizontalScrollOptions {
  initialScrollLeft?: number;
  onScroll?: (scrollLeft: number) => void;
}

export const useSyncedHorizontalScroll = (
  tableRoot: Ref<HTMLElement | null>,
  scrollbar: Ref<HTMLElement | null>,
  options: HorizontalScrollOptions = {},
) => {
  const contentWidth = ref(0);
  const hasOverflow = ref(false);
  let resizeObserver: ResizeObserver | undefined;
  let viewport: HTMLElement | null | undefined;

  const measure = () => {
    if (!viewport?.clientWidth) return;
    contentWidth.value = viewport.scrollWidth;
    hasOverflow.value = viewport.scrollWidth > viewport.clientWidth;
  };

  const syncViewport = () => {
    const bar = scrollbar.value;
    if (viewport && bar?.clientWidth && viewport.scrollLeft !== bar.scrollLeft) {
      viewport.scrollLeft = bar.scrollLeft;
    }
  };

  const syncScrollbar = () => {
    if (!viewport?.clientWidth) return;
    const scrollLeft = viewport.scrollLeft;
    const bar = scrollbar.value;
    if (bar?.clientWidth && bar.scrollLeft !== scrollLeft) {
      bar.scrollLeft = scrollLeft;
    }
    options.onScroll?.(scrollLeft);
  };

  onMounted(async () => {
    await nextTick();
    viewport = tableRoot.value?.querySelector<HTMLElement>('.v-table__wrapper');
    if (!viewport) return;
    if (options.initialScrollLeft !== undefined) {
      viewport.scrollLeft = options.initialScrollLeft;
    }
    measure();

    resizeObserver = new ResizeObserver(measure);
    viewport.addEventListener('scroll', syncScrollbar, { passive: true });
    resizeObserver.observe(viewport);
    const table = viewport.querySelector('table');
    if (table) resizeObserver.observe(table);
    syncScrollbar();
  });

  watch([contentWidth, hasOverflow], syncScrollbar, { flush: 'post' });

  onBeforeUnmount(() => {
    viewport?.removeEventListener('scroll', syncScrollbar);
    resizeObserver?.disconnect();
  });

  return { contentWidth, hasOverflow, syncViewport };
};
