// core
import axios from 'axios';
import { defineStore } from 'pinia';
import { LocalStorage } from 'quasar';

// interfaces
import { IProject, IProjectView } from 'src/interfaces/projects';
import { IIssueFilters, IIssueLabel } from 'src/interfaces/issues';
import { IPassword, IUser, IUserActivityResponse } from 'src/interfaces/users';

// notifications
import { useNotificationStore } from './notification-store';

// constants
import { NON_VALIDATED_ROUTES } from 'src/constants/constants';
import {
  API_AUTH_PREFIX,
  API_USERS_PREFIX,
  API_USERS_ME_PREFIX,
  API_WORKSPACES_PREFIX,
} from 'src/constants/apiPrefix';
import { NOT_FOUND_ERROR_CODES } from 'src/constants/notFoundErrorCodes';
import { FileAttUploadProgressFunc } from 'src/interfaces/files';

const toast = useNotificationStore();
export const api = axios.create({ baseURL: '', withCredentials: true });

export const useAiplanStore = defineStore('aiplan', {
  state: () => ({
    auth: {
      user: undefined,
      // access_token: LocalStorage.getItem('access_token'),
      // refresh_token: LocalStorage.getItem('refresh_token'),
    },

    myWorkspaces: [] as unknown as any[],
    me: undefined as unknown as IUser,
    userActivity: undefined as unknown as IUserActivityResponse,

    allProjects: [] as unknown as IProject[],
    allMembers: [],
    projects: [],
    favorites_projects: [],
    searchProjects: [],
    searchAssignees: [],

    myIssues: [],
    currentIssue: undefined as unknown as any,

    workspaceUsers: [],
    workspaceInvited: [],
    workspaceInfo: undefined as any,

    isRefreshing: false,
    refreshingCall: null as unknown as Promise<any>,
    //baseURL: baseURL,
    api: api,
    isServerUnavailable: false,
  }),

  getters: {
    currentWorkspace(state): any {
      return state.myWorkspaces.find(
        (e: any) =>
          e.slug == this.router.currentRoute.value.params['workspace'],
      );
    },

    currentProject(state): any {
      const p = this.router.currentRoute.value.params['project'];
      if (p) {
        return state.projects.find((e: any) => e.id == p);
      } else {
        return null;
      }
    },
  },

  actions: {
    // ------------- Authorisation -------------
    async login(login: string, password: string, altchaPayload: string) {
      try {
        const d = await api.post('/api/sign-in/', {
          email: login,
          password: password,
          medium: 'email',
          captcha_payload: altchaPayload,
        });

        const data = d.data;
        this.auth = { ...data };

        // LocalStorage.set('access_token', data.access_token);
        // LocalStorage.set('refresh_token', data?.refresh_token);

        await this.getMyWorkspaces();
        await this.usersMe();

        return true;
      } catch (e) {
        return e;
      }
    },

    async registerViaEmail(email: string, captchaPayload: string) {
      return await api.post('/api/sign-up/', {
        email: email,
        captcha_payload: captchaPayload,
      });
    },

    prolongToken() {
      if (this.isRefreshing) return this.refreshingCall;

      this.isRefreshing = true;

      const body = new FormData();
      const item = LocalStorage.getItem('refresh_token');
      LocalStorage.remove('refresh_token');
      if (item === null) {
        this.isRefreshing = false;
        // this.auth.access_token = null;
        // this.auth.refresh_token = null;
        // this.router.replace('/signin');
        return Promise.reject();
      }

      body.append('refresh_token', String(item));

      const axiosClean = axios.create();
      this.refreshingCall = axiosClean
        .post(this.baseURL + '/api/token-prolong/', body, { headers: {} })
        .then((response) => {
          if (!response?.data?.access_token && !response?.data?.refresh_token) {
            this.isRefreshing = false;
            return Promise.reject();
          }

          LocalStorage.set('access_token', response?.data?.access_token);
          LocalStorage.set('refresh_token', response?.data?.refresh_token);
          this.isRefreshing = false;
          return Promise.resolve(true);
        })
        .catch((error) => {
          this.isRefreshing = false;
          return Promise.reject(error);
        });
      return this.refreshingCall;
    },

    resetTokens() {
      LocalStorage.remove('access_token');
      LocalStorage.remove('refresh_token');
      // this.auth.access_token = null;
      // this.auth.refresh_token = null;
    },

    async signOut() {
      // LocalStorage.remove('next_url');
      return await api
        .post(`${API_AUTH_PREFIX}/sign-out/`, {
          refresh_token: LocalStorage.getItem('refresh_token'),
        })
        .then((response) => {
          document.documentElement.style.setProperty('--primary', '#3f75ff');
          document.documentElement.style.setProperty(
            '--primary-light',
            '#ccdbff',
          );
          LocalStorage.remove('special-version');
          LocalStorage.remove('access_token');
          LocalStorage.remove('refresh_token');
          // this.auth.access_token = '';
          return response?.data;
        })
        .catch((error) => {
          LocalStorage.remove('access_token');
          LocalStorage.remove('refresh_token');
          // this.auth.access_token = '';
          throw error?.response?.data;
        });
    },

    forgotPassword(email: string, captchaPayload: string) {
      return api.post('/api/forgot-password/', {
        email: email,
        captcha_payload: captchaPayload,
      });
    },

    async resetPassword(
      uidb64: string,
      token: string,
      data: IPassword,
    ): Promise<any> {
      return await api.post(`/api/reset-password/${uidb64}/${token}/`, data);
    },

    // ------------- User -------------
    // использовать только для запроса после логина!!!
    async usersMe() {
      await api.get(`${API_USERS_ME_PREFIX}`).then(({ data }) => {
        if (this.router.currentRoute.value.path.includes('not-found')) return;
        this.me = data;
        if (!data.is_onboarded) return this.router.replace('/onboarding');

        const url = LocalStorage.getItem('next_url') || '/';
        this.router.replace(url as string);
      });
    },

    async getMyWorkspaces() {
      await api.get(`${API_USERS_ME_PREFIX}/workspaces/`).then(({ data }) => {
        if (data.length === 0) {
          this.router.replace('/no-workspace');
        }
        return (this.myWorkspaces = data);
      });
    },

    async setNameFromOnboard(data: any): Promise<any> {
      return await api.post(`${API_USERS_ME_PREFIX}/onboard/`, data);
    },

    async updateCurrentUser(data: any): Promise<any> {
      return await api
        .patch(`${API_USERS_ME_PREFIX}`, data)
        .then((response) => response?.data)
        .catch((error) => {
          throw error?.response;
        });
    },

    // ------------- Worksapce ------------
    async workspaceMembers(
      offset?: any,
      limit?: any,
      sortBy?: any,
      descending?: boolean,
      searchQuery?: string,
    ) {
      if (!this.router.currentRoute.value.params['workspace']) return;
      return api
        .get(
          `${API_WORKSPACES_PREFIX}/${this.router.currentRoute.value.params['workspace']}/members/`,
          {
            params: {
              offset: offset,
              limit: limit,
              order_by: sortBy || 'id',
              desc: descending == true,
              search_query: searchQuery || '',
            },
          },
        )
        .then((response) => {
          this.workspaceUsers = response?.data;
          return response?.data;
        })
        .catch((error) => {
          throw error?.response?.data;
        });
    },

    // ------------- Project -------------

    async setProjectView(data: {
      view_props?: IProjectView;
      default_props?: IProjectView;
    }): Promise<any> {
      if (
        !this.router.currentRoute.value.params['workspace'] ||
        !this.router.currentRoute.value.params['project']
      )
        return;
      return await api
        .post(
          `${API_WORKSPACES_PREFIX}/${this.router.currentRoute.value.params['workspace']}/projects/${this.router.currentRoute.value.params['project']}/project-views/`,
          data,
        )
        .then((response) => {
          response?.data;
        })
        .catch((error) => {
          throw error?.response?.data;
        });
    },

    getStates(projectid: string) {
      if (!this.router.currentRoute.value.params['workspace']) return;
      return api.get(
        `${API_WORKSPACES_PREFIX}/${this.router.currentRoute.value.params['workspace']}/projects/${projectid}/states/`,
      );
    },

    // ------------- Project Members -------------
    async getProjectMembers(
      offset?: any,
      limit?: any,
      sortBy?: any,
      descending?: boolean,
      searchQuery?: string,
    ) {
      if (
        !this.router.currentRoute.value.params['project'] ||
        !this.router.currentRoute.value.params['workspace']
      )
        return;
      return api
        .get(
          `${API_WORKSPACES_PREFIX}/${this.router.currentRoute.value.params['workspace']}/projects/${this.router.currentRoute.value.params['project']}/members/`,
          {
            params: {
              offset: offset,
              limit: limit,
              order_by: sortBy || 'id',
              desc: descending == true,
              search_query: searchQuery || '',
            },
          },
        )
        .then((response) => {
          this.searchAssignees = response?.data;
          return response?.data;
        })
        .catch((error) => {
          throw error?.response?.data;
        });
    },

    projectMembers(projectid: string) {
      if (!this.router.currentRoute.value.params['workspace']) return;
      return api.get(
        `${API_WORKSPACES_PREFIX}/${this.router.currentRoute.value.params['workspace']}/projects/${projectid}/members/`,
      );
    },

    // ------------- Me in project -------------
    async projectMemberMe() {
      if (!this.router.currentRoute.value.params['project']) return;
      return api
        .get(
          `${API_WORKSPACES_PREFIX}/${this.router.currentRoute.value.params['workspace']}/projects/${this.router.currentRoute.value.params['project']}/project-members/me/`,
        )
        .then((response) => response?.data)
        .catch((error) => {
          throw error?.response;
        });
    },

    async getMyProjectViewProps() {
      return this.projectMemberMe()
        .then((res) => {
          return res?.view_props;
        })
        .catch((error) => {
          throw error;
        });
    },

    async setMyViewProps(props: IProjectView) {
      return api.post(`${API_USERS_ME_PREFIX}/view-props/`, props);
    },

    // ------------- Project labels -------------
    async getProjectLabels(): Promise<IIssueLabel[]> {
      if (
        !this.router.currentRoute.value.params['workspace'] ||
        !this.router.currentRoute.value.params['project']
      )
        return [];
      return api
        .get(
          `${API_WORKSPACES_PREFIX}/${this.router.currentRoute.value.params['workspace']}/projects/${this.router.currentRoute.value.params['project']}/issue-labels/`,
        )
        .then((response) => response?.data)
        .catch((error) => {
          throw error?.response?.data;
        });
    },

    // ------------- All issues -------------
    //не используется
    issuesListSearch(
      offset?: any,
      limit?: any,
      sortBy?: any,
      descending = true,
      show_sub_issues?: boolean,
      draft?: boolean,
      onlyCount?: boolean,
      filters?: IIssueFilters,
      projectId?: string,
    ) {
      if (!this.router.currentRoute.value.params['workspace']) return;
      return api.post(
        `${API_WORKSPACES_PREFIX}/${
          this.router.currentRoute.value.params['workspace']
        }/projects/${
          projectId ?? this.router.currentRoute.value.params['project']
        }/issues/search/`,
        filters,
        {
          params: {
            offset: offset,
            limit: limit,
            order_by: sortBy || 'sequence_id',
            desc: descending == true,
            show_sub_issues: show_sub_issues ?? true,
            only_count: onlyCount ?? false,
            draft: draft ?? false,
          },
        },
      );
    },

    // ------------- Exact issue -------------

    async issueInfo(projectid: string, issuenum: string | number) {
      if (!this.router.currentRoute.value.params['workspace']) return;
      const data = await api.get(
        `${API_WORKSPACES_PREFIX}/${this.router.currentRoute.value.params['workspace']}/projects/${projectid}/issues/${issuenum}/`,
      );
      return data.data;
    },

    issuePartialUpdate(
      workspaceId: string,
      projectid: string,
      issueid: string,
      data: any,
    ) {
      return api.patch(
        `${API_WORKSPACES_PREFIX}/${workspaceId}/projects/${projectid}/issues/${issueid}/`,
        data,
      );
    },

    async issueAttachmentsList(projectid: string, issueid: string) {
      if (!this.router.currentRoute.value.params['workspace']) return;
      const data = await api.get(
        `${API_WORKSPACES_PREFIX}/${this.router.currentRoute.value.params['workspace']}/projects/${projectid}/issues/${issueid}/issue-attachments/`,
      );
      return data.data;
    },

    async issueAttachmentsUploadFile(
      file: File,
      issueId: string,
      onProgress?: (percent: number) => void,
    ) {
      const workspaceSlug = this.router.currentRoute.value.params.workspace;
      const projectId = this.router.currentRoute.value.params.project;

      if (!workspaceSlug || !projectId) {
        return;
      }

      const formData = new FormData();
      formData.append('asset', file);

      try {
        const response = await api.post(
          `${API_WORKSPACES_PREFIX}/${workspaceSlug}/projects/${projectId}/issues/${issueId}/issue-attachments/`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (event) => {
              if (onProgress && event.total) {
                const percent = Math.round((event.loaded * 100) / event.total);
                onProgress(percent);
              }
            },
          },
        );

        return response.data;
      } catch (err) {
        throw err;
      }
    },

    issueAttachmentsUpload(
      ev: any,
      issueId: string | number,
      onProgress?: FileAttUploadProgressFunc,
    ) {
      if (
        !this.router.currentRoute.value.params.workspace ||
        !this.router.currentRoute.value.params.project
      )
        return;

      return this.uploadFileAsync(ev, issueId.toString(), 'issue', onProgress);
    },

    issueAttachmentDelete(issue: string | number, id: string | number) {
      if (
        !this.router.currentRoute.value.params.workspace ||
        !this.router.currentRoute.value.params.project
      )
        return;
      return api.delete(
        `${API_WORKSPACES_PREFIX}/${this.router.currentRoute.value.params.workspace}/projects/${this.router.currentRoute.value.params.project}/issues/${issue}/issue-attachments/${id}/`,
      );
    },

    issueLabelCreate(
      workspaceId: string,
      project: string,
      name: string,
      color: string,
    ) {
      return api.post(
        `${API_WORKSPACES_PREFIX}/${
          workspaceId || this.router.currentRoute.value.params.workspace
        }/projects/${
          project || this.router.currentRoute.value.params.project
        }/issue-labels/`,
        {
          name: name,
          color: color,
        },
      );
    },

    // ------------- Uploads -------------
    async uploadFileAsync(
      ev: {
        preventDefault: () => void;
        stopPropagation: () => void;
        target: {
          files: { length: number; item: (arg0: number) => File | null };
        };
        dataTransfer: { items: DataTransferItemList; files: FileList };
      },

      id?: string,
      type?: 'issue' | 'doc',
      onProgress?: FileAttUploadProgressFunc,
    ): Promise<void> {
      ev.preventDefault();
      ev.stopPropagation();

      /* const uploadFile = (file: File) => {
        return new Promise<void>((resolve, reject) => {
          const metadata = {
            file_name: file.name,
            file_type: file.type,
            file_size: file.size.toString(),
            ...(id ? { [`${type}_id`]: id } : {}),
            ...(type ? { entity_type: type } : {}),
          };

          const upload = new tus.Upload(file, {
            endpoint: uploadUrl,
            metadata,
            storeFingerprintForResuming: false,
            removeFingerprintOnSuccess: true,

            onError(error) {
              console.error('TUS upload failed:', error);
              reject(error);
            },
            onProgress: function (bytesUploaded, bytesTotal) {
              if (onProgress) onProgress(file.name, bytesUploaded, bytesTotal);
            },
            onSuccess() {
              console.log('Upload finished:', upload.url);
              resolve();
            },
          });

          upload.start();
        });
      }; */

      const files: File[] = [];

      if (ev.target?.files) {
        for (let i = 0; i < ev.target.files.length; i++) {
          const file = ev.target.files.item(i);
          if (file) files.push(file);
        }
      } else if (ev.dataTransfer?.items) {
        for (const item of Array.from(ev.dataTransfer.items)) {
          if (item.kind === 'file') {
            const file = item.getAsFile();
            if (file) files.push(file);
          }
        }
      } else if (ev.dataTransfer?.files) {
        for (const file of Array.from(ev.dataTransfer.files)) {
          files.push(file);
        }
      }

      const simulateUpload = async (file: File) => {
        const total = file.size || 1_000_000; // для теста, если size == 0
        const chunkSize = total / 50; // 2% за шаг
        let uploaded = 0;

        return new Promise<void>((resolve) => {
          const interval = setInterval(() => {
            uploaded = Math.min(uploaded + chunkSize, total);
            if (onProgress) onProgress(file.name, uploaded, total);

            if (uploaded >= total) {
              clearInterval(interval);
              console.log(`Simulated upload finished: ${file.name}`);
              resolve();
            }
          }, 50); // шаг каждые 50ms, можно сделать быстрее/медленнее
        });
      };

      for (const file of files) {
        await simulateUpload(file);
      }
      /*
      await Promise.all(files.map(uploadFile)); */
    },

    async uploadUserFile(file: FormData): Promise<any> {
      return this.mediaUpload(`${API_USERS_PREFIX}/file-assets/`, file)
        .then((response) => response?.data)
        .catch((error) => {
          throw error?.response?.data;
        });
    },

    async uploadFile(file: FormData): Promise<any> {
      if (!this.router.currentRoute.value.params.workspace) return;
      return this.mediaUpload(
        `${API_WORKSPACES_PREFIX}/${this.router.currentRoute.value.params.workspace}/file-assets/`,
        file,
      )
        .then((response) => response?.data)
        .catch((error) => {
          throw error?.response?.data;
        });
    },

    async deleteFile(workspace_id: string, assetUrl: string): Promise<any> {
      const lastIndex = assetUrl.lastIndexOf('/');
      const assetId = assetUrl.substring(lastIndex + 1);

      return api
        .delete(
          `${API_WORKSPACES_PREFIX}/file-assets/${workspace_id}/${assetId}/`,
        )
        .then((response) => response?.data)
        .catch((error) => {
          throw error?.response?.data;
        });
    },

    mediaUpload(url: string, data = {}, config = {}): Promise<any> {
      return api({
        method: 'post',
        url: url,
        data,
        headers: { 'Content-Type': 'multipart/form-data' },
        ...config,
      });
    },

    async signOutEverywhere() {
      return api
        .post(`${API_AUTH_PREFIX}/sign-out-everywhere/`, {
          refresh_token: LocalStorage.getItem('refresh_token'),
        })
        .then((response) => {
          document.documentElement.style.setProperty('--primary', '#3f75ff');
          document.documentElement.style.setProperty(
            '--primary-light',
            '#ccdbff',
          );
          LocalStorage.remove('special-version');
          LocalStorage.remove('access_token');
          LocalStorage.remove('refresh_token');
          // this.auth.access_token = '';
          return response?.data;
        })
        .catch((error) => {
          LocalStorage.remove('access_token');
          LocalStorage.remove('refresh_token');
          // this.auth.access_token = '';
          throw error?.response?.data;
        });
    },
  },
});

// const store = useAiplanStore();
const validateRouteCheck = (route: string): boolean => {
  return (
    NON_VALIDATED_ROUTES.find((_route: string) => _route === route) !==
    undefined
  );
};

api.interceptors.request.use(
  async (config) => {
    return new Promise(async (resolve) => {
      //config.baseURL = store.baseURL;

      // if (!LocalStorage.has('access_token')) return resolve(config);
      // let token = LocalStorage.getItem('access_token') as string;
      // try {
      //   if (token) {
      //     const payload = jwtDecode(token);
      //     const expTime = payload.exp * 1000;
      //     const currentTime = new Date().getTime();

      //     if (expTime - currentTime < 1000) {
      //       // await store.prolongToken();
      //       token = LocalStorage.getItem('access_token') as string;
      //     }
      //   }

      //   // config.headers.Authorization = 'Bearer ' + token;

      //   resolve(config);
      // } catch (err) {
      // }
      resolve(config);
    });
  },
  (error) => {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
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
      // case 500:
      //   window.location.href = '/service-unavailable';
      //   break;
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
          toast.setNotificationView({
            open: true,
            type: 'error',
            customMessage: data.code ? data.ru_error : data.error,
          });
        }
        break;
      case 404:
        if (data?.code === 9001) {
          return Promise.reject(error);
        }

        if (data?.code && NOT_FOUND_ERROR_CODES.includes(data?.code)) {
          window.location.href = '/not-found';
        }
        return Promise.reject(error);
      default:
        toast.setNotificationView({
          open: true,
          type: 'error',
          customMessage: data.code ? data.ru_error : data.error,
        });
    }
    return Promise.reject(error);
  },
);
