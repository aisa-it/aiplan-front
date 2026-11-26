import { onBeforeUnmount, ref, watch } from 'vue';

const MIN_WIDTH = 60;
const MAX_WIDTH = 1600;
const STORAGE_PREFIX = 'issue-table-columns:';

export const isResizableIssueColumn = (key: string) =>
  key === 'sequence_id' ||
  key === 'name' ||
  key === 'labels' ||
  key === 'sprint' ||
  key.startsWith('property:');

export const useIssueColumnResize = (
  contextKey: () => string,
  canResize = isResizableIssueColumn,
) => {
  const widths = ref<Record<string, number>>({});

  const storageKey = () => `${STORAGE_PREFIX}${contextKey()}`;
  const load = () => {
    try {
      const parsed: unknown = JSON.parse(
        localStorage.getItem(storageKey()) ?? '{}',
      );
      widths.value =
        parsed && typeof parsed === 'object' && !Array.isArray(parsed)
          ? Object.fromEntries(
              Object.entries(parsed).filter(
                ([, width]) =>
                  typeof width === 'number' &&
                  Number.isFinite(width) &&
                  width >= MIN_WIDTH &&
                  width <= MAX_WIDTH,
              ),
            )
          : {};
    } catch {
      widths.value = {};
    }
  };
  const save = (key = storageKey()) => {
    try {
      if (Object.keys(widths.value).length) {
        localStorage.setItem(key, JSON.stringify(widths.value));
      } else {
        localStorage.removeItem(key);
      }
    } catch {}
  };

  const widthFor = (key: string) => widths.value[key];
  const resetWidth = (key: string) => {
    const next = { ...widths.value };
    delete next[key];
    widths.value = next;
    save();
  };

  let active: {
    key: string;
    pointerId: number;
    startX: number;
    lastX: number;
    startWidth: number;
    minWidth: number;
    storageKey: string;
    frame: number | null;
    previousCursor: string;
    previousUserSelect: string;
  } | null = null;

  const applyMove = () => {
    if (!active) return;
    active.frame = null;
    const width = Math.min(
      MAX_WIDTH,
      Math.max(
        active.minWidth,
        Math.round(active.startWidth + active.lastX - active.startX),
      ),
    );
    if (widths.value[active.key] !== width) {
      widths.value = { ...widths.value, [active.key]: width };
    }
  };
  const onPointerMove = (event: PointerEvent) => {
    if (!active || event.pointerId !== active.pointerId) return;
    active.lastX = event.clientX;
    active.frame ??= requestAnimationFrame(applyMove);
  };
  const stopResize = (event?: PointerEvent) => {
    if (!active || (event && event.pointerId !== active.pointerId)) return;
    if (active.frame !== null) cancelAnimationFrame(active.frame);
    applyMove();
    save(active.storageKey);
    document.body.style.cursor = active.previousCursor;
    document.body.style.userSelect = active.previousUserSelect;
    active = null;
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', stopResize);
    window.removeEventListener('pointercancel', stopResize);
  };
  const startResize = (event: PointerEvent, key: string) => {
    const th = (event.target as HTMLElement).closest('th');
    if (!th || !canResize(key)) return;
    stopResize();
    const assignees = th.parentElement?.querySelector<HTMLElement>(
      'th[data-column="assignees"]',
    );
    active = {
      key,
      pointerId: event.pointerId,
      startX: event.clientX,
      lastX: event.clientX,
      startWidth: widths.value[key] ?? th.getBoundingClientRect().width,
      minWidth:
        key === 'sequence_id'
          ? 65
          : key === 'labels' && assignees
            ? Math.ceil(assignees.getBoundingClientRect().width)
            : MIN_WIDTH,
      storageKey: storageKey(),
      frame: null,
      previousCursor: document.body.style.cursor,
      previousUserSelect: document.body.style.userSelect,
    };
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', stopResize);
    window.addEventListener('pointercancel', stopResize);
  };

  watch(
    contextKey,
    () => {
      stopResize();
      load();
    },
    { immediate: true },
  );
  onBeforeUnmount(() => stopResize());

  return { widthFor, startResize, resetWidth };
};
