import { computed, onScopeDispose, ref, shallowRef, watch } from 'vue';
import type {
  DtoIssueWithCount,
  TypesIssuesListFilters,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';
import type { IssueListQuery } from '../model/issue-list.types';
import type {
  GroupedIssueSource,
  IssueGroup,
  IssueGroupBy,
  IssueGroupResult,
} from '../model/issue-groups';
import { getIssueGroupKey } from '../model/issue-groups';

export const useGroupedIssues = (
  source: GroupedIssueSource,
  getRequest: () => {
    groupBy: IssueGroupBy | null;
    query: IssueListQuery;
    filters: TypesIssuesListFilters;
  },
  onStreamError: (error: unknown, groupBy: IssueGroupBy) => void,
) => {
  const groups = shallowRef<IssueGroup[]>([]);
  const isStreaming = ref(false);
  const loadFailed = ref(false);
  const pageRequests = new Map<
    string,
    { controller: AbortController; page: number }
  >();
  let pagesToRestore = new Map<string, number>();
  let stream: AbortController | undefined;

  const request = computed(() => {
    const { groupBy, query, filters } = getRequest();
    return {
      groupBy,
      query: {
        ...query,
        page: 1,
        includeProperties:
          query.includeProperties || !!groupBy?.startsWith('property:'),
      },
      filters: { ...filters },
    };
  });
  const requestKey = computed(() => JSON.stringify(request.value));

  const abortRequests = () => {
    stream?.abort();
    for (const { controller } of pageRequests.values()) controller.abort();
    pageRequests.clear();
  };

  const load = async (preservePages = false) => {
    const previousPages = preservePages
      ? new Map([
          ...pagesToRestore,
          ...groups.value.map(
            ({ key, page }) =>
              [
                key,
                pageRequests.get(key)?.page ?? pagesToRestore.get(key) ?? page,
              ] as const,
          ),
        ])
      : new Map<string, number>();
    abortRequests();
    pagesToRestore = previousPages;
    groups.value = [];
    loadFailed.value = false;
    const { groupBy, query, filters } = request.value;
    isStreaming.value = !!groupBy;
    if (!groupBy) return;

    const controller = new AbortController();
    stream = controller;
    const key = requestKey.value;
    const isCurrent = () =>
      !controller.signal.aborted && key === requestKey.value;
    const pending = new Map<string, IssueGroup>();
    let frame: number | undefined;

    const flush = () => {
      frame = undefined;
      if (isCurrent() && pending.size) {
        const next = new Map(groups.value.map((group) => [group.key, group]));
        for (const [key, group] of pending) {
          if (!next.has(key)) next.set(key, group);
        }
        groups.value = [...next.values()];
      }
      pending.clear();
    };
    const append = (result: IssueGroupResult) => {
      if (!isCurrent()) return;
      const key = getIssueGroupKey(groupBy, result.entity);
      pending.set(key, { ...result, key, page: 1, loading: false });
      frame ??= requestAnimationFrame(flush);
    };

    try {
      await source.streamGroups(
        filters,
        query,
        groupBy,
        append,
        controller.signal,
      );
    } catch (error) {
      if (isCurrent()) {
        loadFailed.value = true;
        onStreamError(error, groupBy);
      }
    } finally {
      if (frame !== undefined) cancelAnimationFrame(frame);
      flush();
      if (isCurrent()) {
        isStreaming.value = false;
        for (const group of groups.value) {
          const page = previousPages.get(group.key) ?? 1;
          if (page > 1 && group.total) void setPage(group, page);
        }
        if (!loadFailed.value) previousPages.clear();
      }
    }
  };

  const patchGroup = (key: string, patch: Partial<IssueGroup>) => {
    groups.value = groups.value.map((group) =>
      group.key === key ? { ...group, ...patch } : group,
    );
  };

  const setPage = async (group: IssueGroup, page: number) => {
    const { groupBy, query, filters } = request.value;
    if (!groupBy) return;
    pagesToRestore.delete(group.key);
    pageRequests.get(group.key)?.controller.abort();
    const controller = new AbortController();
    const pageRequest = { controller, page };
    pageRequests.set(group.key, pageRequest);
    const key = requestKey.value;
    const isCurrent = () =>
      !controller.signal.aborted && key === requestKey.value;
    patchGroup(group.key, { loading: true });
    try {
      const loadPage = (page: number) =>
        source.loadGroup(
          filters,
          { ...query, page },
          groupBy,
          group.entity,
          controller.signal,
        );
      const currentPage = Math.max(
        1,
        Math.min(page, Math.ceil(group.total / query.rowsPerPage)),
      );
      let result = await loadPage(currentPage);
      if (!isCurrent()) return;
      const lastPage = Math.max(1, Math.ceil(result.total / query.rowsPerPage));
      const nextPage = Math.min(currentPage, lastPage);
      if (nextPage !== currentPage && result.total)
        result = await loadPage(nextPage);
      if (isCurrent()) patchGroup(group.key, { ...result, page: nextPage });
    } catch {
    } finally {
      if (pageRequests.get(group.key) === pageRequest) {
        if (isCurrent()) patchGroup(group.key, { loading: false });
        pageRequests.delete(group.key);
      }
    }
  };

  const refreshAfterUpdate = async (
    before: DtoIssueWithCount,
    after: DtoIssueWithCount,
  ) => {
    const { groupBy, query } = request.value;
    if (!groupBy) return;
    if (
      isStreaming.value ||
      groupBy.startsWith('property:') ||
      (query.onlyActive && before.state !== after.state)
    ) {
      return load(true);
    }

    const beforeKeys = getMembershipKeys(groupBy, before);
    const afterKeys = getMembershipKeys(groupBy, after);
    if (
      afterKeys.some(
        (key) =>
          !beforeKeys.includes(key) &&
          !groups.value.some((group) => group.key === key),
      )
    ) {
      return load(true);
    }
    await Promise.all(
      groups.value
        .filter(
          (group) =>
            beforeKeys.includes(group.key) ||
            afterKeys.includes(group.key) ||
            group.items.some((issue) => issue.id === before.id),
        )
        .map((group) => setPage(group, group.page)),
    );
  };

  watch(requestKey, () => void load(), { immediate: true });
  onScopeDispose(abortRequests);

  return {
    groups,
    isStreaming,
    loadFailed,
    setPage,
    refreshAfterUpdate,
    retry: () => load(true),
  };
};

const getMembershipKeys = (groupBy: IssueGroupBy, issue: DtoIssueWithCount) => {
  const key = (value?: string | null) =>
    getIssueGroupKey(groupBy, value ?? null);
  switch (groupBy) {
    case 'state':
      return [key(issue.state ?? issue.state_detail?.id)];
    case 'priority':
      return [key(issue.priority)];
    case 'author':
      return [key(issue.author_detail?.id)];
    case 'project':
      return [key(issue.project)];
    case 'assignees':
      return issue.assignee_details?.length
        ? issue.assignee_details.map(({ id }) => key(id))
        : [key()];
    case 'watchers':
      return issue.watcher_details?.length
        ? issue.watcher_details.map(({ id }) => key(id))
        : [key()];
    case 'labels':
      return issue.label_details?.length
        ? issue.label_details.map(({ id }) => key(id))
        : [key()];
    default:
      return [];
  }
};
