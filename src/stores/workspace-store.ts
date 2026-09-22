import { defineStore } from 'pinia';
import type {
  DtoProjectLight,
  DtoWorkspace,
  DtoWorkspaceMemberWithOwner,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { Workspace } from '@aisa-it/aiplan-api-ts/src/Workspace';
import { Projects } from '@aisa-it/aiplan-api-ts/src/Projects';
import { withInterceptors } from '@/utils/interceptorsWithInstanceClass';
import { computed, ref } from 'vue';

const projectsApi = new (withInterceptors(Projects))();
const workspaceApi = new (withInterceptors(Workspace))();

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

    workspaceInfo.value = (await workspaceApi.getWorkspace(workspaceSlug)).data;
    await getMeInWorkspace(workspaceSlug);
  }

  async function getMeInWorkspace(
    workspaceSlug: string,
  ): Promise<DtoWorkspaceMemberWithOwner | void> {
    if (!workspaceSlug || workspaceSlug === 'undefined') return;

    const res = await workspaceApi.getWorkspaceCurrentMembership(workspaceSlug);

    return (meInWorkspace.value = res.data);
  }

  async function getWorkspaceProjects(
    workspaceSlug: string,
    filters?: {
      search_query?: string;
    },
  ): Promise<DtoProjectLight[] | void> {
    if (!workspaceSlug || workspaceSlug === 'undefined') return;

    return projectsApi.getProjectList(workspaceSlug, filters).then((res) => {
      workspaceProjects.value = res.data;
      return res.data;
    });
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
