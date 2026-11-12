import { onBeforeUnmount, ref, watch, type Ref } from 'vue';
import type { DtoProjectMemberWithLead, DtoWorkspaceSummaryResponse } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { UserService } from '@/services/user.service';

export function useSidebarProjectMemberships(
  workspaceSlug: Ref<string | null>,
  workspaceSummary: Ref<DtoWorkspaceSummaryResponse | null>,
) {
  const memberships = ref<Record<string, DtoProjectMemberWithLead>>({});
  let request = 0;
  let loadedWorkspace: string | null = null;

  watch([workspaceSlug, workspaceSummary], async ([slug, summary]) => {
    const currentRequest = ++request;
    if (loadedWorkspace !== slug) {
      memberships.value = {};
      loadedWorkspace = slug;
    }

    if (!slug || !summary) return;
    const projectIds = summary.projects?.flatMap(project => project.id ? [project.id] : []) ?? [];
    if (!projectIds.length) {
      memberships.value = {};
      return;
    }

    try {
      const result = await UserService.getCurrentUserProjectMemberships(projectIds);
      if (currentRequest !== request || slug !== workspaceSlug.value) return;
      memberships.value = Object.fromEntries(
        result.filter(membership => membership.project_id).map(membership => [membership.project_id!, membership]),
      );
    } catch (error) {
      if (currentRequest === request) console.error('Failed to load sidebar project memberships', error);
    }
  }, { immediate: true });

  onBeforeUnmount(() => { request++; });

  return memberships;
}
