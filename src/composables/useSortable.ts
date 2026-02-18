import { nextTick, onBeforeUnmount, Ref } from 'vue';
import Sortable from 'sortablejs';

export interface SortableUpdateEvent {
  id: string;
  oldIndex: number;
  newIndex: number;
  evt: Sortable.SortableEvent;
}

export interface UseSortableOptions extends Omit<Sortable.Options, 'onEnd'> {
  onEnd?: (event: SortableUpdateEvent) => void | Promise<void>;
}

export function useSortable(
  container: Ref<HTMLElement | null>,
  options: UseSortableOptions,
) {
  let sortable: Sortable | null = null;

  async function initSortable() {
    await nextTick();

    const el = container.value;

    if (!el) return;
    if (sortable) sortable.destroy();

    sortable = new Sortable(el, {
      ...options,
      animation: options.animation ?? 150,
      draggable: options.draggable,
      handle: options.handle,
      forceFallback: options.forceFallback ?? true,
      fallbackOnBody: options.fallbackOnBody ?? true,
      fallbackTolerance: options.fallbackTolerance ?? 5,
      onEnd: async (evt: Sortable.SortableEvent) => {
        const { oldIndex, newIndex, item } = evt;
        if (oldIndex == null || newIndex == null) return;
        if (oldIndex === newIndex) return;

        const id = (item as HTMLElement).dataset.id;
        if (!id) return;

        if (options.onEnd) {
          await options.onEnd({ id, oldIndex, newIndex, evt });
        }
      },
    });
  }

  onBeforeUnmount(() => {
    if (sortable) sortable.destroy();
  });

  return {
    initSortable,
    getSortable: () => sortable,
  };
}
