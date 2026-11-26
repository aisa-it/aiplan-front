import { computed, ref, shallowRef, watch, type Ref } from 'vue';
import { storeToRefs } from 'pinia';
import type { DtoProjectLight } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { ProjectService } from '@/services/project.service';
import { useWorkspaceStore } from '@/stores/workspace-store';

export function useWorkspaceProjectList(workspaceSlug: Ref<string>) {
  const workspaceStore = useWorkspaceStore();
  const { workspaceProjects } = storeToRefs(workspaceStore);
  const search = ref<string | null>(null);
  const query = computed(() => search.value?.trim() ?? '');
  const searchResults = shallowRef<DtoProjectLight[]>([]);
  const loadingProjects = ref(false);
  const searching = ref(false);

  watch(
    workspaceSlug,
    async (slug, _, onCleanup) => {
      let stale = false;
      onCleanup(() => {
        stale = true;
      });
      search.value = null;
      loadingProjects.value = true;
      try {
        await workspaceStore.getWorkspaceProjects(slug);
      } catch {
        // API errors are displayed by the response interceptor.
      } finally {
        if (!stale) loadingProjects.value = false;
      }
    },
    { immediate: true },
  );

  watch(
    [workspaceSlug, query, workspaceProjects],
    ([slug, term], [previousSlug, previousTerm], onCleanup) => {
      searching.value = !!term;
      if (slug !== previousSlug || term !== previousTerm) {
        searchResults.value = [];
      }
      if (!term) return;

      const controller = new AbortController();
      const timer = window.setTimeout(async () => {
        try {
          const result = await ProjectService.getProjects(
            slug,
            { search_query: term },
            controller.signal,
          );
          if (!controller.signal.aborted) searchResults.value = result;
        } catch {
          // API errors are displayed by the response interceptor.
        } finally {
          if (!controller.signal.aborted) searching.value = false;
        }
      }, 500);
      onCleanup(() => {
        window.clearTimeout(timer);
        controller.abort();
      });
    },
  );

  return {
    search,
    query,
    projects: computed(() =>
      query.value ? searchResults.value : workspaceProjects.value,
    ),
    loading: computed(() =>
      query.value ? searching.value : loadingProjects.value,
    ),
  };
}
