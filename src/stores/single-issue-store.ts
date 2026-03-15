import { defineStore } from 'pinia';
import { useAiplanStore } from './aiplan-store';
import { useRolesStore } from './roles-store';
import { useNotificationStore } from './notification-store';
import {
  IIssueData,
  IIssueTransferById,
  IIssueTransferByLabel,
  IIssueTransferParams,
} from 'src/interfaces/issues';
import {
  buildFormData,
  getActivityOffset,
  trimEmptyTags,
} from 'src/utils/helpers';
import { API_WORKSPACES_PREFIX } from 'src/constants/apiPrefix';
import axios from 'axios';
import { NON_VALIDATED_ROUTES } from 'src/constants/constants';
import { DtoIssueLinkLight } from '@aisa-it/aiplan-api-ts/src/data-contracts';

const aiplan = useAiplanStore();
const rolesStore = useRolesStore();
const { setNotificationView } = useNotificationStore();
const api = aiplan.api;

//TODO: придумать лучшее решение, исключив обработку 404
const shitApi = axios.create({ baseURL: '', withCredentials: true });

const validateRouteCheck = (route: string): boolean => {
  return (
    NON_VALIDATED_ROUTES.find((_route: string) => _route === route) !==
    undefined
  );
};

shitApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const res = error?.response;

    if (res?.data instanceof Blob && res.data.type === 'application/json') {
      try {
        const text = await res.data.text();
        res.data = JSON.parse(text);
      } catch (_) {}
    }
    const { status, data } = res ?? {};
    switch (status) {
      case 401:
        if (
          !validateRouteCheck(window.location.hash) &&
          window.location.pathname != '/signin' &&
          window.location.pathname != '/signin/' &&
          window.location.pathname != '/signup' &&
          !window.location.pathname.includes('/f/')
        ) {
          window.location.href = '/signin';
        } else {
          //TODO: убрать после переноса логина в стор юзера
          setNotificationView({
            open: true,
            type: 'error',
            customMessage: data.code ? data.ru_error : data.error,
          });
        }
        break;
      case 404:
        return Promise.reject(error);
      default:
        setNotificationView({
          open: true,
          type: 'error',
          customMessage: data.code ? data.ru_error : data.error,
        });
    }
    return Promise.reject(error);
  },
);

export const useSingleIssueStore = defineStore('single-issue-store', {
  state: () => {
    return {
      currentIssueID: '',
      issueData: undefined as unknown as any,
      issueCommentsData: undefined as unknown as any,
      issueActivitiesData: undefined as unknown as any,
      issueStatusesData: undefined as unknown as any,
      isRefreshIssue: false,
      isPreview: false,
    };
  },

  getters: {
    issueLink(): string {
      return `${location.protocol}//${location.host}/${this.router.currentRoute.value.params.workspace}/projects/${this.issueData.project ?? this.router.currentRoute.value.params.project}/issues/${this.currentIssueID ?? this.router.currentRoute.value.params.issue}`;
    },
    issueExportPDFLink(): string {
      return `${API_WORKSPACES_PREFIX}/${this.router.currentRoute.value.params.workspace}/projects/${this.issueData.project ?? this.router.currentRoute.value.params.project}/issues/${this.currentIssueID ?? this.router.currentRoute.value.params.issue}/pdf`;
    },
  },

  actions: {
    async getIssueData(workspaceSlug: string, projectID: string) {
      await api
        .get(
          `${API_WORKSPACES_PREFIX}/${workspaceSlug}/projects/${projectID}/issues/${this.currentIssueID}/`,
        )
        .then(async (res) => {
          this.issueData = await res.data;
          // вычисление роли - лучше не трогать
          rolesStore.defineIssueRole(res.data);
        })
        .catch((err) => {
          if (err.response.status == 404) {
            this.router.replace('/not-found');
          }
        });
    },

    // TODO при рефакторинге слить с предущим методом, вынеся из него запись полученной задачи в стейт стора
    async getIssueDataById(
      workspaceSlug: string,
      projectID: string,
      issueId: string,
    ) {
      return await shitApi
        .get(
          `${API_WORKSPACES_PREFIX}/${workspaceSlug}/projects/${projectID}/issues/${issueId}/`,
        )
        .then((res) => res);
    },

    createIssue(
      currentWorkspaceSlug: string,
      projectid: string,
      name: any,
      content: any,
      status: any,
      priority: any,
      assignees: any,
      watchers: any,
      tags: any,
      target_date: any,
      parent: any,
      draft: boolean,
      description_json: any,
      issue_link: DtoIssueLinkLight,
    ) {
      const data = {
        name,
        description_html: trimEmptyTags(content.html),
        description_type: 1,
        state: status,
        priority,
        assignees_list: assignees,
        watchers_list: watchers,
        labels_list: tags,
        target_date,
        parent,
        draft,
        description_json,
        issue_link,
      };

      const formData = buildFormData(data, content.files, 'issue');

      return api.post(
        `${API_WORKSPACES_PREFIX}/${currentWorkspaceSlug}/projects/${projectid}/issues/`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );
    },

    async updateIssueData(
      workspaceSlug: string,
      projectID: string,
      issueID: string,
      data: IIssueData,
      files: Array<File> = [],
    ) {
      if (data.description_html !== '<p></p>') {
        data.description_html = trimEmptyTags(data.description_html);
      }

      const formData = buildFormData(data, files, 'issue');

      return api.patch(
        `${API_WORKSPACES_PREFIX}/${workspaceSlug}/projects/${projectID}/issues/${issueID}/`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );
    },

    openIssue(issue: string, target?: string, project?: string) {
      const url = `/${this.router.currentRoute.value.params.workspace}/projects/${project ?? this.router.currentRoute.value.params.project}/issues/${issue}`;
      if (target && target === '_blank') {
        window.open(url, target);
        return;
      }
      this.router.push(url);
    },

    async deleteIssue(
      workspaceSlug: string,
      projectID: string,
      issueID: string,
    ) {
      return api.delete(
        `${API_WORKSPACES_PREFIX}/${workspaceSlug}/projects/${projectID}/issues/${issueID}/`,
      );
    },

    // ------------- Exact issue transfer -------------
    async issueTransferById(
      data: IIssueTransferById,
      create_entities = false,
      new_issue_params: IIssueTransferParams | null = null,
    ) {
      return await api.post(
        `${API_WORKSPACES_PREFIX}/${this.router.currentRoute.value.params.workspace}/issues/migrate/`,
        new_issue_params ? new_issue_params : {},
        {
          params: {
            ...data,
            create_entities,
          },
        },
      );
    },

    async issueTransferByLabel(
      data: IIssueTransferByLabel,
      create_entities = false,
    ) {
      return await api.post(
        `${API_WORKSPACES_PREFIX}/${this.router.currentRoute.value.params.workspace}/issues/migrate/byLabel/`,
        {},
        {
          params: {
            ...data,
            create_entities,
          },
        },
      );
    },

    // ------------- Exact issue comment -------------
    async issueCommentCreate(
      content: any,
      stripped: string,
      projectID?: string,
    ) {
      const data = {
        comment_json: {},
        comment_html: trimEmptyTags(content.html),
        comment_type: 1,
        comment_stripped: stripped,
      };

      const formData = buildFormData(data, content.files, 'comment');

      await api.post(
        `${API_WORKSPACES_PREFIX}/${this.router.currentRoute.value.params.workspace}/projects/${projectID ?? this.router.currentRoute.value.params.project}/issues/${this.currentIssueID}/comments/`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );
    },

    async issueCommentsList(page: number, pageSize = 10, projectID?: string) {
      if (
        !this.currentIssueID ||
        !this.router.currentRoute.value.params.workspace ||
        (!this.router.currentRoute.value.params.project && !projectID)
      )
        return;

      await shitApi
        .get(
          `${API_WORKSPACES_PREFIX}/${this.router.currentRoute.value.params.workspace}/projects/${projectID ?? this.router.currentRoute.value.params.project}/issues/${this.currentIssueID}/comments/`,
          {
            params: {
              offset: getActivityOffset(page, pageSize),
              limit: pageSize,
            },
          },
        )
        .then((res) => {
          const data = { ...res.data };
          data.pageCount = Math.ceil(res.data.count / pageSize);
          this.issueCommentsData = data;
        });
    },

    async issueCommentDelete(commentID: string, projectID?: string) {
      await api.delete(
        `${API_WORKSPACES_PREFIX}/${this.router.currentRoute.value.params.workspace}/projects/${projectID ?? this.router.currentRoute.value.params.project}/issues/${this.currentIssueID}/comments/${commentID}/`,
      );
    },

    async issueCommentUpdate(
      workspaceSlug: string,
      projectId: string,
      issueId: string,
      commentId: string,
      content: any,
      stripped: string,
      replyToCommentId?: string,
    ) {
      const data = {
        comment_html: trimEmptyTags(content.html),
        comment_stripped: stripped,
        reply_to_comment_id: replyToCommentId,
      };

      const formData = buildFormData(data, content.files, 'comment');

      await api.patch(
        `${API_WORKSPACES_PREFIX}/${workspaceSlug}/projects/${projectId}/issues/${issueId}/comments/${commentId}/`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );
    },

    async issueCommentAddReaction(
      workspaceSlug: string,
      projectId: string,
      issueId: string,
      commentID: string,
      reaction: string,
    ) {
      await api.post(
        `${API_WORKSPACES_PREFIX}/${workspaceSlug}/projects/${projectId}/issues/${issueId}/comments/${commentID}/reactions`,
        {
          reaction: reaction,
        },
      );
    },

    async issueCommentDeleteReaction(
      workspaceSlug: string,
      projectId: string,
      issueId: string,
      commentID: string,
      reactionValue: string,
    ) {
      await api.delete(
        `${API_WORKSPACES_PREFIX}/${workspaceSlug}/projects/${projectId}/issues/${issueId}/comments/${commentID}/reactions/${reactionValue}`,
      );
    },

    async issueCommentCreateReply(
      workspaceSlug: string,
      projectId: string,
      issueId: string,
      content: any,
      stripped: string,
      replyCommentId: string,
    ) {
      const data = {
        comment_html: trimEmptyTags(content.html),
        comment_stripped: stripped,
        reply_to_comment_id: replyCommentId,
      };

      const formData = buildFormData(data, content.files, 'comment');

      await api.post(
        `${API_WORKSPACES_PREFIX}/${workspaceSlug}/projects/${projectId}/issues/${issueId}/comments/`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );
    },

    issueSubIssuesUpdate(projectId: string, issueId: string, data: any) {
      if (!this.router.currentRoute.value.params['workspace']) return;
      return api.post(
        `${API_WORKSPACES_PREFIX}/${this.router.currentRoute.value.params['workspace']}/projects/${projectId}/issues/${issueId}/sub-issues`,
        data,
      );
    },

    async getIssueCommentHistory(
      projectId: string,
      issueId: string,
      commentId: string,
      offset?: number,
      limit?: number,
    ) {
      return await api.get(
        `${API_WORKSPACES_PREFIX}/${this.router.currentRoute.value.params['workspace']}/projects/${projectId}/issues/${issueId}/comments/${commentId}/history`,
        {
          params: {
            offset: offset,
            limit: limit,
          },
        },
      );
    },

    // ------------- Exact issue activities -------------

    async getIssueActivitiesList(
      page: number,
      pageSize = 10,
      field?: string,
      projectID?: string,
    ) {
      if (
        !this.router.currentRoute.value.params.workspace ||
        (!this.router.currentRoute.value.params.project && !projectID) ||
        !this.currentIssueID
      )
        return;
      await api
        .get(
          `${API_WORKSPACES_PREFIX}/${this.router.currentRoute.value.params.workspace}/projects/${projectID ?? this.router.currentRoute.value.params.project}/issues/${this.currentIssueID}/activities/`,
          {
            params: {
              offset: getActivityOffset(page, pageSize),
              limit: pageSize,
              field: field,
            },
          },
        )
        .then((res) => {
          const data = res.data;
          data.pageCount = Math.ceil(res.data.count / pageSize);

          if (field === 'state') {
            this.issueStatusesData = data;
            return;
          }

          this.issueActivitiesData = data;
        })
        .catch((err) => {
          if (err.response.status == 404) {
            this.router.replace('/not-found');
          }
        });
    },

    async getAvailableParentIssues(
      workspaceSlug: string,
      projectID: string,
      issueID: string,
      params: any,
    ) {
      return api.get(
        `${API_WORKSPACES_PREFIX}/${workspaceSlug}/projects/${projectID}/issues/${issueID}/parent-issues/available/`,
        { params: params },
      );
    },

    async getAvailableBlockIssues(
      workspaceSlug: string,
      projectID: string,
      issueID: string,
      params: any,
    ) {
      return api.get(
        `${API_WORKSPACES_PREFIX}/${workspaceSlug}/projects/${projectID}/issues/${issueID}/blocks-issues/available/`,
        { params: params },
      );
    },

    async getAvailableBlockerIssues(
      workspaceSlug: string,
      projectID: string,
      issueID: string,
      params: any,
    ) {
      return api.get(
        `${API_WORKSPACES_PREFIX}/${workspaceSlug}/projects/${projectID}/issues/${issueID}/blockers-issues/available/`,
        { params: params },
      );
    },

    // ------------- Exact issue links -------------
    issueLinkToClipboard() {
      navigator.clipboard.writeText(
        this.issueData?.short_url ?? this.issueLink,
      );
    },

    issueСommentsLinkToClipboard(comment_id: string) {
      const baseUrl = this.issueLink;
      const link = `${baseUrl}/${comment_id}`;
      navigator.clipboard.writeText(link);
    },

    async issueLinkCreate(
      workspaceSlug: string,
      projectID: string,
      issueID: any,
      url: any,
      name: any,
    ) {
      return await api.post(
        `${API_WORKSPACES_PREFIX}/${workspaceSlug}/projects/${projectID}/issues/${issueID}/issue-links/`,
        { metadata: {}, title: name, url: url },
      );
    },

    async issueLinkEdit(
      workspaceSlug: string,
      projectID: string,
      issueID: any,
      url: any,
      name: any,
      linkId: string,
    ) {
      return await api.patch(
        `${API_WORKSPACES_PREFIX}/${workspaceSlug}/projects/${projectID}/issues/${issueID}/issue-links/${linkId}`,
        { metadata: {}, title: name, url: url },
      );
    },

    async issueLinkDelete(
      workspaceSlug: string,
      projectID: string,
      issueID: any,
      link: any,
    ) {
      return await api.delete(
        `${API_WORKSPACES_PREFIX}/${workspaceSlug}/projects/${projectID}/issues/${issueID}/issue-links/${link}/`,
      );
    },

    issueUploadCommentFile(ev: {
      preventDefault: () => void;
      stopPropagation: () => void;
      target: { files: { length: number; item: (arg0: number) => any } };
      dataTransfer: { items: any; files: any };
    }) {
      return new Promise((res) => {
        if (ev.target.files) {
          for (let i = 0; i < ev.target.files.length; i++) {
            const file = ev.target.files[i];
            const formData = new FormData();
            formData.append('asset', file);
            formData.append(
              'attributes',
              JSON.stringify({ name: file.name, size: file.size }),
            );
            res(
              api.post(
                `${API_WORKSPACES_PREFIX}/${this.router.currentRoute.value.params.workspace}/file-assets/`,
                formData,
                {
                  headers: {
                    'Content-Type': 'multipart/form-data',
                  },
                },
              ),
            );
          }
        }
      });
    },

    async exportIssuePDF(
      workspaceSlug: string,
      projectID: string,
      issueID: string,
    ) {
      return api.get(
        `${API_WORKSPACES_PREFIX}/${workspaceSlug}/projects/${projectID}/issues/${issueID}/pdf`,
        {
          responseType: 'blob',
        },
      );
    },
  },
});
