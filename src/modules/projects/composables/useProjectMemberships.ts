import { computed, shallowRef, watch, type Ref } from 'vue';
import type {
  DtoProjectLight,
  DtoProjectMemberWithLead,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { UserService } from '@/services/user.service';

export function useProjectMemberships(
  workspaceSlug: Ref<string | null>,
  projects: Ref<DtoProjectLight[]>,
) {
  const memberships = shallowRef<Record<string, DtoProjectMemberWithLead>>({});
  const projectIds = computed(() =>
    [...new Set(projects.value.flatMap(({ id }) => (id ? [id] : [])))].sort(),
  );
  const projectIdsKey = computed(() => JSON.stringify(projectIds.value));
  const membershipsLoading = shallowRef(false);

  watch(
    [workspaceSlug, projectIdsKey],
    async ([slug], [previousSlug], onCleanup) => {
      let stale = false;
      onCleanup(() => {
        stale = true;
      });
      const ids = projectIds.value;
      if (slug !== previousSlug || !ids.length) memberships.value = {};
      membershipsLoading.value = false;
      if (!slug || !ids.length) return;

      membershipsLoading.value = true;
      try {
        const result = await UserService.getCurrentUserProjectMemberships(ids);
        if (stale) return;
        const byProjectId: Record<string, DtoProjectMemberWithLead> = {};
        for (const membership of result) {
          if (membership.project_id) byProjectId[membership.project_id] = membership;
        }
        memberships.value = byProjectId;
      } catch {
        // API errors are displayed by the response interceptor.
      } finally {
        if (!stale) membershipsLoading.value = false;
      }
    },
    { immediate: true },
  );

  return { memberships, membershipsLoading };
}
