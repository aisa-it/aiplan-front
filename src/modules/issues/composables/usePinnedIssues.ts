import { onBeforeUnmount, onMounted, ref } from 'vue';
import type { DtoIssueWithCount } from '@aisa-it/aiplan-api-ts/src/data-contracts';

import { loadPinnedIssues } from '../api/pinned-issues.source';
import type { ProjectIssueListScope } from '../model/issue-list.types';

const PAGE_SIZE = 50;

export const usePinnedIssues = (scope: ProjectIssueListScope) => {
  const items = ref<DtoIssueWithCount[]>([]);
  const total = ref<number | null>(null);
  const isLoading = ref(true);
  const isLoadingMore = ref(false);

  let controller: AbortController | undefined;
  let requestId = 0;

  const loadNext = async () => {
    if (
      controller ||
      (total.value !== null && items.value.length >= total.value)
    ) {
      return;
    }

    const currentRequest = ++requestId;
    controller = new AbortController();
    const signal = controller.signal;
    const firstPage = items.value.length === 0;
    isLoading.value = firstPage;
    isLoadingMore.value = !firstPage;

    try {
      const result = await loadPinnedIssues(
        scope,
        items.value.length,
        PAGE_SIZE,
        signal,
      );
      if (signal.aborted || currentRequest !== requestId) return;

      items.value = [...items.value, ...result.items];
      total.value = result.total;
    } catch {
    } finally {
      if (currentRequest === requestId) {
        controller = undefined;
        isLoading.value = false;
        isLoadingMore.value = false;
      }
    }
  };

  onMounted(() => void loadNext());
  onBeforeUnmount(() => {
    requestId++;
    controller?.abort();
  });

  return { items, isLoading, isLoadingMore, loadNext };
};
