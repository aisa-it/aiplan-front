import { defineStore, storeToRefs } from 'pinia';
import { useRolesStore } from './roles-store';
import { useUserStore } from './user-store';
import {
  AiplanActivityTable,
  AiplanCreateWorkspaceRequest,
  DaoPaginationResponse,
  DtoProjectLight,
  DtoStateLight,
  DtoWorkspace,
  DtoWorkspaceMember,
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

const rolesStore = useRolesStore();
const userStore = useUserStore();
const { userWorkspaces } = storeToRefs(userStore);
const projectsApi = new (withInterceptors(Projects))();
const workspaceApi = new (withInterceptors(Workspace))();

const api = new HttpClient();

interface RootStore {
  currentWorkspaceSlug: string | null;
  workspaceInfo?: DtoWorkspace;
  workspaceToken?: string;
  workspaceProjects: DtoProjectLight[];
  WorkspaceActivityMap: Record<string, AiplanActivityTable> | []; // не используется
  workspaceUsers: DtoWorkspaceMember[];
  foundUsers: DtoWorkspaceMember[];
  allWorkspaceStates?: Record<string, DtoStateLight[]>;
  stopRefresh: boolean;
}
export const useWorkspaceStore = defineStore('workspace-store', {
  state: (): RootStore => {
    return {
      currentWorkspaceSlug: null,
      workspaceInfo: undefined,
      workspaceToken: '',
      workspaceProjects: [],
      WorkspaceActivityMap: [], // не используется
      workspaceUsers: [],
      foundUsers: [],
      allWorkspaceStates: undefined,
      stopRefresh: false,
    };
  },

  actions: {
    async getWorkspaceInfo(
      workspaceSlug: string,
      isInAdminPanel = false,
    ): Promise<DtoWorkspace | void> {
      if (!workspaceSlug || workspaceSlug === 'undefined') return;

      return workspaceApi
        .getWorkspace(workspaceSlug)
        .then((res) => {
          this.workspaceInfo = res.data;

          // вычисление роли - лучше не трогать
          //TODO: убрать и добавить членство юзера в запрос выше
          userStore.getUserWorkspaces().then(() => {
            const ws = userWorkspaces.value.find(
              (elem) => elem.slug === res.data.slug,
            );
            rolesStore.defineWorkspaceRole(ws);
          });

          // Проверяем есть ли доступ к рабочему пространству
          if (
            !rolesStore.hasPermissionByWorkspace(res.data, 'show-ws') &&
            !isInAdminPanel
          ) {
            window.location.href = '/access-denied';
          }
        })
        .catch((err) => {
          if (err.response.status == 404) {
            this.router.replace('/not-found');
          }
          return Promise.reject(err);
        });
    },

    async createWorkspace(
      data: AiplanCreateWorkspaceRequest,
    ): Promise<DtoWorkspace | any> {
      await workspaceApi.createWorkspace(data).then((res) => res.data);
    },

    async getWorkspaceMembers(
      workspaceSlug: string,
      data?: {
        offset?: number;
        limit?: number;
        order_by?: string;
        desc?: boolean;
        search_query?: string;
      },
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
          !data?.search_query
            ? (this.workspaceUsers = res.data.result)
            : (this.foundUsers = res.data.result);
          return res.data;
        });
    },

    async getWorkspaceMembersByQuery(
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
    },

    // раньше использовалось для блокировки и разблокировки юзера
    // сейчас по контракту принимает третим параметром роль (видимо меняет роль юзера)
    // что с этим делать?
    async controlWorkspaceUser(
      workspaceSlug: string,
      memberID: string,
      value: boolean,
    ): Promise<void> {
      await workspaceApi
        .updateWorkspaceMember(workspaceSlug, memberID, {
          blocked: value,
        })
        .then((res) => res.data);
    },

    async getWorkspaceProjects(
      workspaceSlug: string,
      filters?: {
        search_query?: string;
      },
      stopRefresh?: boolean,
    ): Promise<DtoProjectLight[] | void> {
      if (!workspaceSlug || workspaceSlug === 'undefined') return;

      return projectsApi.getProjectList(workspaceSlug, filters).then((res) => {
        // временное решение - пока не трогать
        if (stopRefresh) this.stopRefresh = stopRefresh;
        this.workspaceProjects = res.data;
        return res.data;
      });
    },

    // ВРЕМЕННОЕ РЕШЕНИЕ ДЛЯ РАСШИРЕННОГО ПОИСКА, ЧТОБЫ НЕ МЕНЯТЬ СТЕЙТ
    // чем отличается от предыдущего сервиса? (getWorkspaceProjects)
    async getWsProjects(
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
    },

    // коммент актуален?
    // async getWorkspaceBackups(
    //   workspaceSlug: string,
    // ): Promise<DaoWorkspaceBackup[]> {
    //   return workspaceApi
    //     .workspacesBackupsDetail(workspaceSlug)
    //     .then((response) => response?.data)
    //     .catch((error) => {
    //       throw error?.response?.data;
    //     });
    // },

    // async uploadAndImportWorkspace(file: File): Promise<any> {
    //   return workspaceApi
    //     .workspacesImportCreate({ backup: file })
    //     .then((response) => response)
    //     .catch((error) => {
    //       throw error?.response?.data;
    //     });
    // },

    async getAllWorkspaceStates(
      currentWorkspaceSlug: string,
    ): Promise<Record<string, DtoStateLight[]> | void> {
      if (!currentWorkspaceSlug || currentWorkspaceSlug === 'undefined') return;

      return workspaceApi
        .getWorkspaceStateList(currentWorkspaceSlug)
        .then((res) => (this.allWorkspaceStates = res.data));
    },

    async getJitsiToken(
      currentWorkspaceSlug: string,
    ): Promise<Record<string, string> | any> {
      return workspaceApi
        .getWorkspaceJitsiToken(currentWorkspaceSlug)
        .then((res) => res.data);
    },

    async getWorkspaceNotifications(
      workspaceSlug: string,
    ): Promise<DtoWorkspaceMember | void> {
      if (!workspaceSlug || workspaceSlug === 'undefined') return;

      return (await workspaceApi.getWorkspaceMemberMe(workspaceSlug)).data;
    },

    async setAiDocNotificationSettings(
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
    },
  },
});
