import { defineStore } from 'pinia';
import { withInterceptors } from 'src/utils/interceptorsWithInstanceClass';
import { Users } from '@aisa-it/aiplan-api-ts/src/Users';
import { Workspace } from '@aisa-it/aiplan-api-ts/src/Workspace';
import { Projects } from '@aisa-it/aiplan-api-ts/src/Projects';
import {
  DtoUser,
  DaoPaginationResponse,
  AiplanPasswordRequest,
  AiplanAddProjectToFavoritesRequest,
  AiplanRequestAddFavorite,
  DtoWorkspaceWithCount,
  TypesActivityTable,
  DtoUserLight,
  DtoProjectLight,
  AiplanUserUpdateRequest,
  AiplanPasswordResponse,
  DtoEntityActivityFull,
  DtoWorkspaceMember,
  DtoProjectMember,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';

const usersApi = new (withInterceptors(Users))();
const workspaceApi = new (withInterceptors(Workspace))();
const projectsApi = new (withInterceptors(Projects))();

interface IUserState {
  user: DtoUser | undefined;
  userWorkspaces: DtoWorkspaceWithCount[];
  userActivity: DaoPaginationResponse;
  userActivityMap: TypesActivityTable;
  userProjects: DtoProjectLight[];
  authToken: string;
  userWorkspacesMemberships: Record<string, DtoWorkspaceMember>;
  userProjectsMemberships: Record<string, DtoProjectMember>;
}

export const useUserStore = defineStore('user-store', {
  state: (): IUserState => {
    return {
      user: undefined,
      userWorkspaces: [] as DtoWorkspaceWithCount[],
      userActivity: {} as DaoPaginationResponse,
      userActivityMap: {} as TypesActivityTable,
      userProjects: [] as DtoProjectLight[],
      authToken: undefined as unknown as string,
      userWorkspacesMemberships: {},
      userProjectsMemberships: {},
    };
  },
  getters: {
    getTheme(): string {
      const theme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
      const userTheme = this.user?.theme?.dark ? 'dark' : 'light';
      return this.user?.theme?.system ? theme : userTheme;
    },
  },
  actions: {
    setLastWorkspaceSlug() {
      let currentSlug = '';
      if (this.userWorkspaces.length && this.user?.last_workspace_slug) {
        currentSlug = this.userWorkspaces.find(
          (ws) => ws.slug === this.user?.last_workspace_slug,
        )
          ? this.user?.last_workspace_slug
          : this.userWorkspaces[0]?.slug || '';
      }
      this.user.last_workspace_slug = currentSlug;
    },

    // TODO зачем async в синхронной функции? Нужно ли очищать остальные поля стора? Если да, то возможно стоит исопользвать готовый $reset в pinia
    async clearUserState() {
      this.user = {} as DtoUser;
      this.userWorkspaces = [];
    },

    async clearUserActivityMap() {
      this.userActivityMap = {} as TypesActivityTable;
    },

    async getUserInfo(): Promise<DtoUser> {
      await usersApi.getCurrentUser().then((res) => {
        this.user = res.data;

        if (this.router.currentRoute.value.path.includes('not-found')) return;

        if (!res.data.is_onboarded) return this.router.replace('/onboarding');
      });

      if (this.user.theme?.open_in_new === undefined)
        this.updateCurrentUser({
          theme: {
            dark: this.user.theme?.dark,
            contrast: this.user.theme?.contrast,
            open_in_new: false,
          },
        });

      return this.user;
    },

    async setMeTutorial(numStep: number) {
      await usersApi.updateUserTutorial({ step: numStep }).then((res) => {
        this.user.tutorial = res.data.tutorial;
      });
    },

    async getUserById(id: string): Promise<DtoUserLight | any> {
      if (!id) return;

      return usersApi.getUser(id).then((res) => res.data);
    },

    // Это пока только для лайаота админки, потому игрушка дъявола сверху своим роутингом ломает вход в админку
    // FIXME: надо как то по-умному переделать
    async getMe(): Promise<DtoUserLight | any> {
      return usersApi.getCurrentUser().then((res) => (this.user = res.data));
    },

    async getUserWorkspaces(
      filters?: { search_query: string },
      isFilters = false,
    ): Promise<DtoWorkspaceWithCount[] | undefined> {
      return workspaceApi.getUserWorkspaceList(filters).then((res) => {
        if (res.data.length === 0 && !isFilters) {
          this.userWorkspaces = [];
          if (
            !isFilters &&
            this.user.is_onboarded === true &&
            this.router.currentRoute.value.path !== '/no-workspace/profile'
          )
            this.router.replace('/no-workspace');
          return [];
        }
        this.userWorkspaces = filters ? this.userWorkspaces : res.data;
        this.setLastWorkspaceSlug();
        return res.data;
      });
    },

    async getUserProjects(filters?: {
      search_query: string;
    }): Promise<DtoProjectLight[]> {
      return usersApi.getCurrentUserAllProjectList(filters).then((res) => {
        this.userProjects = filters ? this.userProjects : res.data;
        return res.data;
      });
    },

    async getUserWorkspacesMemberships() {
      const wsMemberships = await usersApi
        .getCurrentUserWorkspaceMemberships([])
        .then((res) => res.data);
      this.userWorkspacesMemberships = {};
      wsMemberships.forEach((el) => {
        if (el.workspace_id)
          this.userWorkspacesMemberships[el.workspace_id] = el;
      });
    },

    async getUserProjectsMemberships() {
      const projectMemberships = await usersApi
        .getCurrentUserProjectMemberships([])
        .then((res) => res.data);
      this.userProjectsMemberships = {};
      projectMemberships.forEach((el) => {
        if (el.project_id) {
          this.userProjectsMemberships[el.project_id] = el;
        }
      });
    },

    async addProjectToFavorites(
      workspaceSlug: string,
      project: AiplanAddProjectToFavoritesRequest,
    ): Promise<void> {
      await projectsApi.addProjectToFavorites(workspaceSlug, project);
    },

    async removeProjectFromFavorites(
      workspaceSlug: string,
      projectID: string,
    ): Promise<void> {
      await projectsApi.removeProjectFromFavorites(workspaceSlug, projectID);
    },

    async setNameFromOnboard(data: DtoUser): Promise<DtoUser | any> {
      return usersApi.updateUserOnBoard(data);
    },

    async updateCurrentUser(data: AiplanUserUpdateRequest): Promise<DtoUser> {
      return usersApi
        .updateCurrentUser(data)
        .then((res) => (this.user = res.data));
    },

    async changeMyPassword(
      data: AiplanPasswordRequest,
    ): Promise<AiplanPasswordResponse> {
      return usersApi.updateMyPassword(data).then((res) => res.data);
    },

    async getUserActivities(data?: {
      day?: string;
      offset?: number;
      limit?: number;
      workspace?: string[];
      project?: string[];
    }): Promise<
      DaoPaginationResponse & {
        result?: DtoEntityActivityFull[];
      }
    > {
      return usersApi
        .getMyActivityList(data)
        .then((res) => (this.userActivity = res.data));
    },

    async getAuthToken(): Promise<void> {
      await usersApi
        .getMyAuthToken()
        .then((res) => (this.authToken = res.data));
    },

    async resetAuthToken(): Promise<void> {
      await usersApi
        .resetMyAuthToken()
        .then(async () => await this.getAuthToken());
    },

    async uploadUserAvatar(data: { file: File }): Promise<DtoUser | any> {
      return usersApi.updateCurrentUserAvatar(data);
    },

    async deleteUserAvatar(): Promise<DtoUser | any> {
      return usersApi.deleteCurrentUserAvatar();
    },

    async deleteFavoriteWorkspace(uuid: string | undefined): Promise<void> {
      if (!uuid || uuid === 'undefined') return;

      await workspaceApi
        .removeWorkspaceFromFavorites(uuid)
        .then(async () => await this.getUserWorkspaces());
    },

    async addFavoriteWorkspace(data: AiplanRequestAddFavorite): Promise<void> {
      if (!data.workspace || data.workspace === 'undefined') return;

      await workspaceApi
        .addWorkspaceToFavorites(data)
        .then(async () => await this.getUserWorkspaces());
    },

    async getActivityDate(data: {
      from: string;
      to: string;
      workspace?: string[];
      project?: string[];
    }): Promise<void> {
      await usersApi.getMyActivitiesTable(data).then((res) => {
        this.userActivityMap = res.data;
      });
    },

    async getUserActivityDateById(
      id: string,
      data: { from: string; to: string },
    ): Promise<void> {
      await usersApi.getUserActivitiesTable(id, data).then((res) => {
        this.userActivityMap = res.data;
      });
    },

    async getUserActivitiesByID(
      id: string,
      data?: {
        day?: string;
        offset?: number;
        limit?: number;
      },
    ): Promise<
      DaoPaginationResponse & {
        result?: DtoEntityActivityFull[];
      }
    > {
      return usersApi
        .getUserActivityList(id, data)
        .then((res) => (this.userActivity = res.data));
    },
  },
});
