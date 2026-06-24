import { defineStore } from 'pinia';
import { useRouter } from 'vue-router';
import { useRolesStore } from './roles-store';
import {
  AiplanCreateWorkspaceRequest,
  DaoPaginationResponse,
  DtoProjectLight,
  DtoStateLight,
  DtoWorkspace,
  DtoWorkspaceMember,
  DtoWorkspaceMemberWithOwner,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { Workspace } from '@aisa-it/aiplan-api-ts/src/Workspace';
import { Projects } from '@aisa-it/aiplan-api-ts/src/Projects';
import { withInterceptors } from 'src/utils/interceptorsWithInstanceClass';
import { AiplanWorkspaceNotificationRequest } from 'src/interfaces/aidocNotificationSettings';

import {
  ContentType,
  HttpClient,
  RequestParams,
} from '@aisa-it/aiplan-api-ts/src/http-client';
import { computed, ref, watch } from 'vue';

const projectsApi = new (withInterceptors(Projects))();
const workspaceApi = new (withInterceptors(Workspace))();
const router = useRouter();

const api = new HttpClient();

export const useWorkspaceStore = defineStore('workspace-store', () => {
  const currentWorkspaceSlug = ref<string | null>(null);
  const workspaceInfo = ref<DtoWorkspace>();
  const workspaceToken = ref<string>('');
  const workspaceProjects = ref<DtoProjectLight[]>([]);
  const workspaceUsers = ref<DtoWorkspaceMember[]>([]);
  const foundUsers = ref<DtoWorkspaceMember[]>([]);
  const allWorkspaceStates = ref<Record<string, DtoStateLight[]>>();
  const stopRefresh = ref<boolean>(false);
  const meInWorkspace = ref<DtoWorkspaceMemberWithOwner>({});

  const workspaceLogo = computed<string | undefined>(
    () => workspaceInfo?.value?.logo ?? undefined,
  );

  const workspaceName = computed<string | undefined>(
    () => workspaceInfo?.value?.name ?? undefined,
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

  async function createWorkspace(
    data: AiplanCreateWorkspaceRequest,
  ): Promise<DtoWorkspace | any> {
    await workspaceApi.createWorkspace(data).then((res) => res.data);
  }

  async function getWorkspaceMembers(
    workspaceSlug: string,
    data?: {
      offset?: number;
      limit?: number;
      order_by?: string;
      desc?: boolean;
      search_query?: string;
    },
    isInitState = true,
  ): Promise<
    | (DaoPaginationResponse & {
        result?: DtoWorkspaceMember[];
      })
    | void
  > {
    if (!workspaceSlug) return;

    return workspaceApi
      .getWorkspaceMemberList(workspaceSlug, data)
      .then((res) => {
        if (!isInitState) return res.data;

        !data?.search_query
          ? (workspaceUsers.value = res.data.result)
          : (foundUsers.value = res.data.result);
        return res.data;
      });
  }

  async function getWorkspaceMembersByQuery(
    workspaceSlug: string,
    filters?: {
      search_query: string;
    },
  ): Promise<
    DaoPaginationResponse & {
      result?: DtoWorkspaceMember[];
    }
  > {
    return workspaceApi
      .getWorkspaceMemberList(workspaceSlug, filters)
      .then((res) => res?.data);
  }

  // раньше использовалось для блокировки и разблокировки юзера
  // сейчас по контракту принимает третим параметром роль (видимо меняет роль юзера)
  // что с этим делать?
  async function controlWorkspaceUser(
    workspaceSlug: string,
    memberID: string,
    value: boolean,
  ): Promise<void> {
    await workspaceApi
      .updateWorkspaceMember(workspaceSlug, memberID, {
        blocked: value,
      })
      .then((res) => res.data);
  }

  async function getWorkspaceProjects(
    workspaceSlug: string,
    filters?: {
      search_query?: string;
    },
    isStopRefresh?: boolean,
  ): Promise<DtoProjectLight[] | void> {
    if (!workspaceSlug || workspaceSlug === 'undefined') return;

    return projectsApi.getProjectList(workspaceSlug, filters).then((res) => {
      // временное решение - пока не трогать
      if (isStopRefresh) stopRefresh.value = isStopRefresh;
      workspaceProjects.value = res.data;
      return res.data;
    });
  }

  // ВРЕМЕННОЕ РЕШЕНИЕ ДЛЯ РАСШИРЕННОГО ПОИСКА, ЧТОБЫ НЕ МЕНЯТЬ СТЕЙТ
  // чем отличается от предыдущего сервиса? (getWorkspaceProjects)
  async function getWsProjects(
    workspaceSlug: string,
    filters?: {
      search_query?: string;
    },
  ) {
    if (workspaceSlug === undefined) return;
    const { data } = await projectsApi.getProjectList(workspaceSlug, {
      ...filters,
    });
    return data;
  }

  async function getAllWorkspaceStates(
    currentWorkspaceSlug: string,
  ): Promise<Record<string, DtoStateLight[]> | void> {
    if (!currentWorkspaceSlug || currentWorkspaceSlug === 'undefined') return;

    return workspaceApi
      .getWorkspaceStateList(currentWorkspaceSlug)
      .then((res) => (allWorkspaceStates.value = res.data));
  }

  async function getJitsiToken(
    currentWorkspaceSlug: string,
  ): Promise<Record<string, string> | any> {
    return workspaceApi
      .getWorkspaceJitsiToken(currentWorkspaceSlug)
      .then((res) => res.data);
  }

  async function setAiDocNotificationSettings(
    workspaceSlug: string,
    notificationSettings: AiplanWorkspaceNotificationRequest,
    params: RequestParams = {},
  ) {
    // workspaceApi.updateMyNotifications(workspaceSlug, data); - нет в Workspace
    api.request({
      path: `/api/auth/workspaces/${workspaceSlug}/me/notifications/`,
      method: 'POST',
      body: notificationSettings,
      secure: true,
      type: ContentType.Json,
      ...params,
    });
  }

  async function changeWorkspace(newSlug: string | null) {
    currentWorkspaceSlug.value = newSlug ?? null;
    if (newSlug) {
      await getWorkspaceProjects(newSlug);
    } else {
      workspaceProjects.value = [];
    }
  }

  return {
    currentWorkspaceSlug,
    workspaceInfo,
    workspaceToken,
    workspaceProjects,
    workspaceUsers,
    foundUsers,
    allWorkspaceStates,
    stopRefresh,
    meInWorkspace,
    workspaceLogo,
    workspaceName,
    getMeInWorkspace,
    getWorkspaceInfo,
    createWorkspace,
    getWorkspaceMembers,
    getWorkspaceMembersByQuery,
    controlWorkspaceUser,
    getWorkspaceProjects,
    getWsProjects,
    getAllWorkspaceStates,
    getJitsiToken,
    setAiDocNotificationSettings,
    changeWorkspace,
  };
});
