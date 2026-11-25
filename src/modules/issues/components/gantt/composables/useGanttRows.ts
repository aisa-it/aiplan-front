import { onScopeDispose, provide, ref, shallowRef, watch, watchPostEffect, type Ref, type VNode } from 'vue';
import type { DtoIssueWithCount } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { ganttLayoutKey, type GanttRow } from '../model/gantt-rows';

export function useGanttRows(
  pane: Ref<HTMLElement | null>,
  scrollbar: Ref<HTMLElement | null>,
) {
  const rows = shallowRef<GanttRow[]>([]);
  const scrollRange = ref(0);
  const registered = new Map<HTMLElement, { key: number; issue: DtoIssueWithCount }>();
  let rowKey = 0;
  let frame: number | undefined;
  let content: Element | null = null;
  let scroller: HTMLElement | null = null;
  let mirroredTop = 0;
  let observedPane: HTMLElement | null = null;
  let disposed = false;

  const observer = new ResizeObserver(schedule);

  function measure() {
    frame = undefined;
    if (!pane.value) return;
    const currentScroller = pane.value.querySelector<HTMLElement>(
      '[data-gantt-scroll], [data-gantt-table] .v-table__wrapper',
    );
    if (scroller !== currentScroller) {
      if (scroller) observer.unobserve(scroller);
      scroller = currentScroller;
      if (scroller) observer.observe(scroller);
      syncScrollbar();
    }

    const currentContent = scroller?.firstElementChild ?? null;
    if (content !== currentContent) {
      if (content) observer.unobserve(content);
      if (currentContent) observer.observe(currentContent);
      content = currentContent;
    }
    scrollRange.value = scroller ? scroller.scrollHeight - scroller.clientHeight : 0;

    const bounds = pane.value.getBoundingClientRect();
    const clip = scroller?.getBoundingClientRect() ?? bounds;
    const visible: GanttRow[] = [];
    for (const [element, row] of registered) {
      const rect = element.getBoundingClientRect();
      if (!rect.height || rect.bottom <= clip.top || rect.top >= clip.bottom) continue;
      visible.push({ ...row, centerY: (rect.top + rect.bottom) / 2 - bounds.top });
    }
    rows.value = visible;
  }

  function schedule() {
    if (!disposed) frame ??= requestAnimationFrame(measure);
  }

  function register(vnode: VNode, issue: DtoIssueWithCount) {
    const element = vnode.el;
    if (!(element instanceof HTMLElement)) return;
    const existing = registered.get(element);
    if (!existing) observer.observe(element);
    registered.set(element, { key: existing?.key ?? ++rowKey, issue });
    schedule();
  }

  provide(ganttLayoutKey, {
    layoutChanged: schedule,
    rowProps: ({ item }) => ({
      onVnodeMounted: (vnode) => register(vnode, item),
      onVnodeUpdated: (vnode) => register(vnode, item),
      onVnodeUnmounted({ el }) {
        if (!(el instanceof HTMLElement)) return;
        observer.unobserve(el);
        registered.delete(el);
        schedule();
      },
    }),
  });

  watchPostEffect(() => {
    if (observedPane) observer.unobserve(observedPane);
    observedPane = pane.value;
    if (observedPane) observer.observe(observedPane);
    schedule();
  });

  function scrollTable(delta: number) {
    scroller?.scrollBy({ top: delta, behavior: 'instant' });
  }

  function onTableScroll(event: Event) {
    if (event.target !== scroller) return;
    // Let a pending native scrollbar event reach the table before mirroring it back.
    if (scrollbar.value?.scrollTop === mirroredTop) syncScrollbar();
    schedule();
  }

  function syncScrollbar() {
    const bar = scrollbar.value;
    if (!bar) return;
    const top = scroller?.scrollTop ?? 0;
    if (top !== bar.scrollTop) bar.scrollTop = top;
    mirroredTop = bar.scrollTop;
  }

  function onScrollbarScroll() {
    const top = scrollbar.value?.scrollTop;
    if (top === undefined || top === mirroredTop || !scroller) return;
    mirroredTop = top;
    scroller.scrollTop = top;
  }

  watch(scrollRange, syncScrollbar, { flush: 'post' });

  onScopeDispose(() => {
    disposed = true;
    observer.disconnect();
    if (frame !== undefined) cancelAnimationFrame(frame);
  });

  return { rows, scrollRange, onScrollbarScroll, onTableScroll, scrollTable };
}
