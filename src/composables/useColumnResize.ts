import { LocalStorage } from 'quasar';
import { computed, onBeforeUnmount, reactive } from 'vue';

export const COLUMN_MIN_WIDTH = 60;
export const COLUMN_MAX_WIDTH = 1600;
const STORAGE_PREFIX = 'issue-table-columns:';

// колонки с фиксированной шириной: содержимое короткое (даты, счётчики,
// аватары), тянуть их нечего — ручка не рисуется, сохранённая ширина
// игнорируется
export const FIXED_WIDTH_COLUMNS = new Set([
  'priority',
  'state',
  'target_date',
  'created_at',
  'updated_at',
  'author',
  'assignees',
  'sub_issues_count',
  'linked_issues_count',
  'link_count',
  'attachment_count',
  // таблица спринтов
  'start_date',
  'end_date',
  'all_issues_count',
]);

export const isResizableColumn = (name: string) =>
  !FIXED_WIDTH_COLUMNS.has(name);

// минимум ширины: ID — половина дефолтных 130px, метки — не уже колонки
// исполнителей (у той ширины нет, меряем её заголовок в той же строке)
const minWidthFor = (name: string, th: HTMLElement): number => {
  if (name === 'sequence_id') return 65;
  if (name === 'labels') {
    const assignees = th.parentElement?.querySelector<HTMLElement>(
      'th.assignees-column',
    );
    if (assignees) return Math.ceil(assignees.getBoundingClientRect().width);
  }
  return COLUMN_MIN_WIDTH;
};

type ColumnWidths = Record<string, number>;

// Ширины колонок живут в модульном реактивном реестре по ключу контекста
// (проект/спринт): при группировке на странице несколько IssueTable, и все
// они читают один объект — перетянул колонку в одной, перерисовались все.
const registry = reactive<Record<string, ColumnWidths>>({});

const storageKey = (contextKey: string) => `${STORAGE_PREFIX}${contextKey}`;

const loadWidths = (contextKey: string): ColumnWidths => {
  try {
    const raw = LocalStorage.getItem(storageKey(contextKey));
    if (raw && typeof raw === 'object') return raw as ColumnWidths;
  } catch {
    // LocalStorage недоступен (приватный режим и т.п.) — работаем без памяти
  }
  return {};
};

const saveWidths = (contextKey: string, widths: ColumnWidths) => {
  try {
    if (Object.keys(widths).length === 0) {
      LocalStorage.remove(storageKey(contextKey));
    } else {
      LocalStorage.set(storageKey(contextKey), widths);
    }
  } catch {
    // см. loadWidths
  }
};

const getWidths = (contextKey: string): ColumnWidths => {
  if (!registry[contextKey]) registry[contextKey] = loadWidths(contextKey);
  return registry[contextKey];
};

const clamp = (w: number, min = COLUMN_MIN_WIDTH) =>
  Math.min(COLUMN_MAX_WIDTH, Math.max(min, Math.round(w)));

// имя property-колонки содержит «:» и uuid — в css-переменную его не тащим
const cssName = (name: string) => name.replace(/[^a-zA-Z0-9_-]/g, '-');

export function useColumnResize(contextKey: () => string) {
  const widths = computed(() => getWidths(contextKey()));

  // инлайновая тройка width/min/max перебивает css-дефолты колонки; для
  // нетронутых колонок стиля нет — они живут на дефолтах из scss
  const columnStyle = (name: string) => {
    const w = widths.value[name];
    if (!w || !isResizableColumn(name)) return undefined;
    const px = `${w}px`;
    return { width: px, minWidth: px, maxWidth: px };
  };

  // css-переменные --col-<имя> на обёртке таблицы: scss-ширины колонок,
  // сидящие и на td (labels, sequence_id), читают их вместо констант —
  // без этого td с min-width из scss не даёт колонке ужаться
  const columnVars = computed(() => {
    const vars: Record<string, string> = {};
    for (const [name, w] of Object.entries(widths.value)) {
      if (isResizableColumn(name)) vars[`--col-${cssName(name)}`] = `${w}px`;
    }
    return vars;
  });

  const setWidth = (name: string, width: number, min?: number) => {
    widths.value[name] = clamp(width, min);
  };

  const resetWidth = (name: string) => {
    delete widths.value[name];
    saveWidths(contextKey(), widths.value);
  };

  let active: {
    name: string;
    startX: number;
    startWidth: number;
    minWidth: number;
    rafId: number | null;
    lastX: number;
  } | null = null;

  const applyMove = () => {
    if (!active) return;
    active.rafId = null;
    setWidth(
      active.name,
      active.startWidth + active.lastX - active.startX,
      active.minWidth,
    );
  };

  const onMouseMove = (e: MouseEvent) => {
    if (!active) return;
    active.lastX = e.clientX;
    // не чаще кадра — иначе на широких таблицах перерисовка тормозит drag
    active.rafId ??= requestAnimationFrame(applyMove);
  };

  const stopResize = () => {
    if (!active) return;
    if (active.rafId != null) cancelAnimationFrame(active.rafId);
    applyMove();
    saveWidths(contextKey(), widths.value);
    active = null;

    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', stopResize);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  };

  // слушатели на window, а не на ручке: иначе drag рвётся, стоит курсору
  // уйти с узкой полоски
  const startResize = (e: MouseEvent, name: string) => {
    const th = (e.currentTarget as HTMLElement | null)?.closest('th');
    if (!th || !isResizableColumn(name)) return;

    active = {
      name,
      startX: e.clientX,
      lastX: e.clientX,
      startWidth: widths.value[name] ?? th.getBoundingClientRect().width,
      minWidth: minWidthFor(name, th),
      rafId: null,
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', stopResize);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  onBeforeUnmount(stopResize);

  return {
    columnStyle,
    columnVars,
    startResize,
    resetWidth,
    isResizableColumn,
  };
}
