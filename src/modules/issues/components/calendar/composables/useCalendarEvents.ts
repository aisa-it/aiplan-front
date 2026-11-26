import { ref, shallowRef, watch } from 'vue';
import type { DtoIssueWithCount } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { loadCalendarEvents, type CalendarRequest } from '../utils/calendar-events';

type CalendarResult = Awaited<ReturnType<typeof loadCalendarEvents>>;

export function useCalendarEvents(getRequest: () => CalendarRequest) {
  const data = shallowRef<CalendarResult>({ issues: new Map(), byDay: new Map() });
  const loading = ref(false);
  const failed = ref(false);
  const revision = ref(0);
  const pendingNames = new Map<string, string>();

  watch([getRequest, revision], async ([request], [previous], onCleanup) => {
    const controller = new AbortController();
    onCleanup(() => controller.abort());
    if (request !== previous) {
      data.value = { issues: new Map(), byDay: new Map() };
      pendingNames.clear();
    }
    loading.value = true;
    failed.value = false;

    try {
      const result = await loadCalendarEvents(request, controller.signal);
      if (controller.signal.aborted) return;
      for (const [id, name] of pendingNames) {
        const loaded = result.issues.get(id);
        if (loaded) result.issues.set(id, { ...loaded, name });
      }
      pendingNames.clear();
      data.value = result;
    } catch {
      if (!controller.signal.aborted) {
        failed.value = true;
        controller.abort();
        loading.value = false;
      }
    } finally {
      if (!controller.signal.aborted) loading.value = false;
    }
  }, { immediate: true });

  function updateIssue(issue: DtoIssueWithCount, name?: string) {
    if (!issue.id || !data.value.issues.has(issue.id)) return;
    if (name !== undefined && loading.value) pendingNames.set(issue.id, name);
    const issues = new Map(data.value.issues);
    issues.set(issue.id, issue);
    data.value = { ...data.value, issues };
  }

  return { data, loading, failed, updateIssue, reload: () => revision.value++ };
}
