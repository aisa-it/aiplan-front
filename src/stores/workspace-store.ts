import { defineStore } from 'pinia';
import type {
  DtoProjectLight,
  DtoWorkspace,
  DtoWorkspaceMemberWithOwner,
  DtoWorkspaceSummaryResponse,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { computed, ref } from 'vue';
import { ProjectService } from '@/services/project.service';
import { WorkspaceService } from '@/services/workspace.service';

export const useWorkspaceStore = defineStore('workspace-store', () => {
  const currentWorkspaceSlug = ref<string | null>(null);
  const workspaceInfo = ref<DtoWorkspace>();
  const workspaceProjects = ref<DtoProjectLight[]>([]);
  const workspaceSummary = ref<DtoWorkspaceSummaryResponse | null>(null);
  const meInWorkspace = ref<DtoWorkspaceMemberWithOwner>({});
  const isLoading = ref(false);
  let latestSummaryRequest = 0;

  const workspaceLogo = computed<string | undefined>(
    () => workspaceInfo.value?.logo ?? undefined,
  );

  const workspaceName = computed<string | undefined>(
    () => workspaceInfo.value?.name ?? undefined,
  );

  async function getWorkspaceInfo(
    workspaceSlug: string,
  ): Promise<DtoWorkspace | void> {
    if (!workspaceSlug || workspaceSlug === 'undefined') return;

    if (currentWorkspaceSlug.value !== workspaceSlug) {
      workspaceProjects.value = [];
      workspaceSummary.value = null;
    }

    workspaceInfo.value = await WorkspaceService.getWorkspace(workspaceSlug);
    currentWorkspaceSlug.value = workspaceInfo.value.slug ?? '';
    await getMeInWorkspace(workspaceSlug);
  }

  async function getMeInWorkspace(
    workspaceSlug: string,
  ): Promise<DtoWorkspaceMemberWithOwner | void> {
    if (!workspaceSlug || workspaceSlug === 'undefined') return;

    return (meInWorkspace.value =
      await WorkspaceService.getMeInWorkspace(workspaceSlug));
  }

  async function getWorkspaceProjects(
    workspaceSlug: string,
    filters?: {
      search_query?: string;
    },
  ): Promise<DtoProjectLight[] | void> {
    if (!workspaceSlug || workspaceSlug === 'undefined') return;

    const projects = await ProjectService.getProjects(workspaceSlug, filters);
    if (currentWorkspaceSlug.value === workspaceSlug) workspaceProjects.value = projects;
    return projects;
  }

  async function getWorkspaceSummary(workspaceSlug: string) {
    if (!workspaceSlug || workspaceSlug === 'undefined') return;
    const request = ++latestSummaryRequest;
    const summary = await WorkspaceService.getWorkspaceSummary(workspaceSlug);
    if (request === latestSummaryRequest && currentWorkspaceSlug.value === workspaceSlug) {
      workspaceSummary.value = summary;
    }
  }

  return {
    currentWorkspaceSlug,
    workspaceInfo,
    workspaceProjects,
    workspaceSummary,
    meInWorkspace,
    workspaceLogo,
    workspaceName,
    isLoading,
    getMeInWorkspace,
    getWorkspaceInfo,
    getWorkspaceProjects,
    getWorkspaceSummary,
  };
});
