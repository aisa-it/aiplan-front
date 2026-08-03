import { defineStore } from 'pinia';
import { useRouter } from 'vue-router';
import { useRolesStore } from './roles-store';
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

  const router = useRouter();

  const workspaceLogo = computed<string | undefined>(
    () => workspaceInfo.value?.logo ?? undefined,
  );

  const workspaceName = computed<string | undefined>(
    () => workspaceInfo.value?.name ?? undefined,
  );

  async function getMeInWorkspace(
    workspaceSlug: string,
  ): Promise<DtoWorkspaceMemberWithOwner | void> {
    if (!workspaceSlug || workspaceSlug === 'undefined') return;

    const res = await workspaceApi.getWorkspaceCurrentMembership(workspaceSlug);

    return (meInWorkspace.value = res.data);
  }

  async function getWorkspaceInfo(
    workspaceSlug: string,
    isInAdminPanel = false,
  ): Promise<DtoWorkspace | void> {
    if (!workspaceSlug || workspaceSlug === 'undefined') return;

    return workspaceApi
      .getWorkspace(workspaceSlug)
      .then(async (res) => {
        const rolesStore = useRolesStore();
        workspaceInfo.value = res.data;

        await getMeInWorkspace(workspaceSlug);

        // TODO: Архитектурный долг - Циклическая зависимость.
        // roles-store и workspace-store зависят друг от друга. Нужно будет вынести эту логику в сервис или на уровень выше.
        rolesStore.defineWorkspaceRole(meInWorkspace.value);

        // Проверяем есть ли доступ к рабочему пространству
        if (
          !rolesStore.hasPermissionByWorkspace(
            workspaceInfo.value,
            'show-ws',
          ) &&
          !isInAdminPanel
        ) {
          window.location.href = '/access-denied';
        }
      })
      .catch((err) => {
        if (err.response.status == 404) {
          router.replace('/not-found');
        }
        return Promise.reject(err);
      });
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
    getMeInWorkspace,
    getWorkspaceInfo,
    getWorkspaceProjects,
  };
});
