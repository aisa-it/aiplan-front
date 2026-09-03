import { nextTick, onBeforeUnmount, onMounted, ref, type Ref } from 'vue';

export const useSyncedHorizontalScroll = (
  tableRoot: Ref<HTMLElement | null>,
  scrollbar: Ref<HTMLElement | null>,
) => {
  const contentWidth = ref(0);
  let resizeObserver: ResizeObserver | undefined;
  let scrollingSource: 'viewport' | 'scrollbar' | undefined;

  const getViewport = () =>
    tableRoot.value?.querySelector<HTMLElement>('.v-table__wrapper');

  const getTable = () =>
    tableRoot.value?.querySelector<HTMLTableElement>('.v-table__wrapper table');

  const measure = () => {
    contentWidth.value = getTable()?.scrollWidth ?? 0;
  };

  const syncViewport = () => {
    const viewport = getViewport();

    if (!viewport || !scrollbar.value || scrollingSource === 'viewport') {
      return;
    }

    scrollingSource = 'scrollbar';
    viewport.scrollLeft = scrollbar.value.scrollLeft;
    requestAnimationFrame(() => (scrollingSource = undefined));
  };

  const syncScrollbar = () => {
    const viewport = getViewport();

    if (!viewport || !scrollbar.value || scrollingSource === 'scrollbar') {
      return;
    }

    scrollingSource = 'viewport';
    scrollbar.value.scrollLeft = viewport.scrollLeft;
    requestAnimationFrame(() => (scrollingSource = undefined));
  };

  onMounted(async () => {
    await nextTick();
    measure();

    resizeObserver = new ResizeObserver(measure);
    const viewport = getViewport();
    const table = getTable();

    if (viewport) {
      viewport.addEventListener('scroll', syncScrollbar, { passive: true });
      resizeObserver.observe(viewport);
    }
    if (table) resizeObserver.observe(table);
  });

  onBeforeUnmount(() => {
    getViewport()?.removeEventListener('scroll', syncScrollbar);
    resizeObserver?.disconnect();
  });

  return {
    contentWidth,
    measure,
    syncViewport,
  };
};
