import { defineStore, storeToRefs } from 'pinia';
import { withInterceptors } from 'src/utils/interceptorsWithInstanceClass';
import { Projects } from '@aisa-it/aiplan-api-ts/src/Projects';
import { Users } from '@aisa-it/aiplan-api-ts/src/Users';
import { valToNet } from 'src/utils/strings';
import { getProjectEmojiViaCode } from 'src/utils/helpers';
import { useWorkspaceStore } from './workspace-store';
import { useRolesStore } from './roles-store';
import {
  AiplanCreateProjectRequest,
  AiplanProjectNotificationRequest,
  DaoPaginationResponse,
  DtoLabelLight,
  DtoProject,
  DtoProjectMember,
  DtoProjectMemberLight,
  DtoStateLight,
  TypesViewProps,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { allColumns } from 'src/modules/issue-list/constants/tableColumns';
import axios from 'axios';
import { NEW_GROUP_BY_OPTIONS, PARSED_GROUP } from 'src/constants/constants';

const workspaceStore = useWorkspaceStore();
const { workspaceProjects } = storeToRefs(workspaceStore);
const rolesStore = useRolesStore();

const projectsApi = new (withInterceptors(Projects))();
const usersApi = new (withInterceptors(Users))();

interface IProjectState {
  project: any; // TODO as DtoProject, нарушается типизация из-за public и emijo тудушка в getProjectInfo
  projectLabels: DtoLabelLight[];
  projectMembers: DtoProjectMemberLight[];
  currentProjectID: string;
  meInProject: DtoProjectMember;
  isLoadProjectInfo: boolean;
  errorLoadProjects: boolean;
  projectProps: TypesViewProps | null;
  projectStatuses: Record<string, DtoStateLight[]>;
}
export const api = axios.create({ baseURL: '', withCredentials: true });

export const useProjectStore = defineStore('project-store', {
  state: (): IProjectState => {
    return {
      project: undefined as unknown as any,
      projectLabels: [] as DtoLabelLight[],
      projectMembers: [] as DtoProjectMemberLight[],
      currentProjectID: '', // TODO нигде не обновляется, хотя используется в setProjectInfo
      meInProject: {} as DtoProjectMember,
      isLoadProjectInfo: false, // TODO не используется
      errorLoadProjects: false,
      projectProps: null,
      projectStatuses: {},
    };
  },

  getters: {
    currentProject(): any {
      const projectID = this.router.currentRoute.value.params['project'];
      return workspaceProjects.value.find(
        (e: any) => e.id == projectID || e.identifier === projectID,
      );
    },
    // TODO нигде не используется, поля notification_author_settings_telegram нет в DtoProjectMember
    getAuthorEmailNotification(): any {
      return this.meInProject.notification_author_settings_tg;
    },
    isGroupingEnabled(): boolean | undefined {
      return (
        this.projectProps?.filters?.group_by?.toLowerCase() !== 'none' || false
      );
    },

    /** Возвращает статусы проекта как массив*/
    getStatusesAsArray(): DtoStateLight[] {
      const statuses: DtoStateLight[][] = [];
      for (const state in this.projectStatuses) {
        statuses.push(this.projectStatuses[state]);
      }
      return statuses.flat();
    },
    getTableColumns() {
      return allColumns.filter((column) => {
        if (column.name === 'sequence_id') return true;

        return this.projectProps?.columns_to_show?.some(
          (c) => c === column?.name,
        );
      });
    },
  },

  actions: {
    setProjectInfo() {
      this.project = workspaceProjects.value.find(
        (e: any) => e.id == this.currentProjectID,
      );

      if (this.project) {
        this.project.public = valToNet(this.project.public);
        this.project.emoji = getProjectEmojiViaCode(
          this.project.emoji?.value ?? this.project.emoji,
        );
      }

      rolesStore.defineProjectRole(this.project);
    },

    async getProjectInfo(workspaceSlug: string, projectID: string) {
      if (!workspaceSlug || !projectID) return;

      await projectsApi
        .getProject(workspaceSlug, projectID)
        .then((res) => {
          this.project = res.data;

          // TODO обновление publick и emoji нарушает типизацию
          this.project.public = valToNet(this.project.public);
          this.project.emoji = getProjectEmojiViaCode(this.project.emoji);

          rolesStore.defineProjectRole(res?.data);

          // Проверяем есть ли доступ к проекту
          if (!rolesStore.hasPermissionByProject(res.data, 'show-project')) {
            window.location.href = '/access-denied';
          }
        })
        .catch((err) => {
          if (err?.response?.status == 404) {
            this.errorLoadProjects = true;
            this.router.replace('/not-found');
          }
          throw new Error(err);
        });
    },

    async createProject(
      workspaceSlug: string,
      data: AiplanCreateProjectRequest,
    ): Promise<DtoProject> {
      return projectsApi
        .createProject(workspaceSlug, data)
        .then((res) => res.data);
    },

    // TODO удалить после переноса в модуль
    async updateProject(
      workspaceSlug: string,
      projectID: string,
      data: DtoProject,
    ): Promise<void> {
      await projectsApi
        .updateProject(workspaceSlug, projectID, data)
        .then(async () => await this.getProjectInfo(workspaceSlug, projectID));
    },

    // ----------------------------- PROJECT LABELS -----------------------------
    async getProjectLabels(
      workspaceSlug: string,
      projectID: string,
      queryData?: { search_query?: string },
    ): Promise<DtoLabelLight[]> {
      return projectsApi
        .getIssueLabelList(workspaceSlug, projectID, queryData)
        .then((response) => {
          if (!queryData?.search_query) {
            this.projectLabels = response.data;
          }
          return response.data;
        });
    },

    // ----------------------------- PROJECT STATUSES -----------------------------

    async getProjectStatuses(
      workspaceSlug: string,
      projectID: string,
      queryData?: { search_query?: string },
    ): Promise<Record<string, DtoStateLight[]>> {
      return projectsApi
        .getStateList(workspaceSlug, projectID, queryData)
        .then((response) => {
          if (!queryData?.search_query) {
            this.projectStatuses = response.data;
          }
          return response.data;
        });
    },

    // ----------------------------- PROJECT MEMBERS -----------------------------

    async getProjectMembers(
      workspaceSlug: string,
      projectID: string,
      queryData?: {
        offset?: number;
        limit?: number;
        search_query?: string;
        order_by?: string;
        desc?: boolean;
        find_by?: string[];
      },
    ): Promise<
      | (DaoPaginationResponse & {
          my_entity?: DtoProjectMemberLight;
          result?: DtoProjectMemberLight[];
        })
      | undefined
    > {
      if (!projectID) return;

      return projectsApi
        .getProjectMemberList(workspaceSlug, projectID, queryData)
        .then((res) => {
          if (!queryData) {
            this.projectMembers = res.data.result || [];
          }
          return res.data;
        })
        .catch((err) => {
          if (err.response.status == 404) {
            this.router.replace('/not-found');
          }
          throw new Error(err);
        });
    },

    // PROJECT MEMBERS FOR MENTION
    async getProjectMembersForMention(
      issueData: any,
      workspaceSlug: string,
      projectID: string,
      queryData?: {
        offset?: number;
        limit?: number;
        search_query?: string;
        order_by?: string;
        desc?: boolean;
        find_by?: string[];
      },
    ): Promise<DtoProjectMemberLight[]> {
      return this.getProjectMembers(workspaceSlug, projectID, queryData).then(
        (res) => {
          const items =
            res?.result.filter(
              (m: DtoProjectMemberLight) =>
                m.member?.is_active && m.member?.username,
            ) ?? [];
          if (issueData) {
            const authorId = issueData.author_detail.id;
            const assigneesIds = issueData.assignees || [];
            const watchersIds = issueData.watchers || [];
            const priorityIds = Array.from(
              new Set([authorId, ...assigneesIds, ...watchersIds]),
            );
            items.sort((a: any, b: any) => {
              const aMemberId = a.member?.id;
              const bMemberId = b.member?.id;
              const maxPriority = priorityIds.length;

              const aPriorityMember = priorityIds.indexOf(aMemberId);
              const bPriorityMember = priorityIds.indexOf(bMemberId);

              const aPriority =
                aPriorityMember === -1 ? maxPriority : aPriorityMember;
              const bPriority =
                bPriorityMember === -1 ? maxPriority : bPriorityMember;

              return aPriority - bPriority;
            });
          }
          return items;
        },
      );
    },

    projectLinkToClipboard(project_id: string) {
      navigator.clipboard.writeText(
        `${location.protocol}//${location.host}/${this.router.currentRoute.value.params.workspace}/projects/${project_id}/issues`,
      );
    },

    // ----------------------------- ME IN PROJECT -----------------------------

    async getMeInProject(
      workspaceSlug: string,
      projectID: string,
    ): Promise<DtoProjectMember | undefined> {
      if (!projectID) return;

      return projectsApi
        .getProjectMemberMe(workspaceSlug, projectID)
        .then((res) => {
          this.meInProject = res.data;
          this.projectProps = res.data?.view_props || null;
          return res.data;
        })
        .catch((err) => {
          if (err.response.status == 404) {
            this.router.replace('/not-found');
          }
          throw new Error(err);
        });
    },

    async getMyProjectViewProps(
      workspaceSlug: string,
      projectID: string,
    ): Promise<TypesViewProps | undefined> {
      if (!projectID) return;

      return this.getMeInProject(workspaceSlug, projectID).then(
        (res) => res?.view_props,
      );
    },

    async setMyViewProps(props: TypesViewProps): Promise<void> {
      usersApi.updateUserViewProps(props);
    },

    async setProjectNotificationSettings(
      workspaceSlug: string,
      projectID: string,
      data: AiplanProjectNotificationRequest,
    ) {
      projectsApi.updateMyNotifications(workspaceSlug, projectID, data);
    },

    async setProjectProps(
      workspaceSlug: string,
      projectID: string,
      view_props: TypesViewProps,
    ) {
      return projectsApi.updateProjectView(
        workspaceSlug,
        projectID,
        view_props,
      );
    },

    isGroupHide(groupId: string) {
      if (
        this.projectProps?.group_tables_hide &&
        this.projectProps?.group_tables_hide[groupId]
      )
        return Boolean(this.projectProps?.group_tables_hide[groupId]);
      else return false;
    },

    async setGroupHide(groupToHide: string, hideValue: boolean) {
      const props = JSON.parse(JSON.stringify(this.projectProps));

      if (!props.group_tables_hide) props.group_tables_hide = {};

      props.group_tables_hide[groupToHide] = !hideValue;
      try {
        await this.setProjectProps(
          this.router.currentRoute.value.params.workspace as string,
          this.router.currentRoute.value.params.project as string,
          props,
        );
        this.projectProps = props;
        return props;
      } catch (e) {}
    },
  },
});
