import { defineStore } from 'pinia';
import type {
  DtoProjectLight,
  DtoWorkspace,
  DtoWorkspaceMemberWithOwner,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { computed, ref } from 'vue';
import { ProjectService } from '@/services/project.service';
import { WorkspaceService } from '@/services/workspace.service';

export const useWorkspaceStore = defineStore('workspace-store', () => {
  const currentWorkspaceSlug = ref<string | null>(null);
  const workspaceInfo = ref<DtoWorkspace>();
  const workspaceProjects = ref<DtoProjectLight[]>([]);
  const meInWorkspace = ref<DtoWorkspaceMemberWithOwner>({});
  const isLoading = ref(false);

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

    workspaceInfo.value = await WorkspaceService.getWorkspace(workspaceSlug);
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

    return (workspaceProjects.value = await ProjectService.getProjects(
      workspaceSlug,
      filters,
    ));
  }

  return {
    currentWorkspaceSlug,
    workspaceInfo,
    workspaceProjects,
    meInWorkspace,
    workspaceLogo,
    workspaceName,
    isLoading,
    getMeInWorkspace,
    getWorkspaceInfo,
    getWorkspaceProjects,
  };
});
