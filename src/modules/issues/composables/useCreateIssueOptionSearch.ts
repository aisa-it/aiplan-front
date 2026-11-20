import { computed, ref, shallowRef, watch, type Ref } from 'vue';

export const useCreateIssueOptionSearch = <T extends { id?: string }>(
  load: Ref<
    (search: string, offset: number, signal: AbortSignal) =>
      Promise<{ items: T[]; nextOffset?: number }>
  >,
) => {
  const menu = ref(false);
  const search = ref<string>();
  const items = shallowRef<T[]>([]);
  const isLoading = ref(false);
  const nextOffset = ref<number>();
  const hasMore = computed(() => nextOffset.value !== undefined);
  let loadPage: ((offset: number) => Promise<void>) | undefined;

  const loadMore = () => {
    if (!isLoading.value && nextOffset.value !== undefined) {
      void loadPage?.(nextOffset.value);
    }
  };

  watch(
    [menu, search, load],
    ([isOpen, searchValue, loadOptions], _, onCleanup) => {
      items.value = [];
      nextOffset.value = undefined;
      isLoading.value = isOpen;
      if (!isOpen) return;

      const controller = new AbortController();
      const { signal } = controller;
      const query = searchValue?.trim() ?? '';

      const run = async (offset: number) => {
        isLoading.value = true;
        try {
          const result = await loadOptions(query, offset, signal);
          if (signal.aborted) return;

          const unique = new Map(items.value.map((item) => [item.id, item]));
          for (const item of result.items) {
            if (item.id) unique.set(item.id, item);
          }
          items.value = [...unique.values()];
          nextOffset.value = result.nextOffset;
        } catch {
          // The HTTP client reports request errors.
        } finally {
          if (!signal.aborted) isLoading.value = false;
        }
      };

      loadPage = run;
      const timeout = query ? setTimeout(() => void run(0), 300) : undefined;
      if (timeout === undefined) void run(0);

      onCleanup(() => {
        loadPage = undefined;
        clearTimeout(timeout);
        controller.abort();
      });
    },
  );

  return { menu, search, items, isLoading, hasMore, loadMore };
};
