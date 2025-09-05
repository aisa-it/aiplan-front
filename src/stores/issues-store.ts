import { defineStore } from 'pinia';
import { useAiplanStore } from './aiplan-store';
import { IIssueFilters } from 'src/interfaces/issues';
import { API_AUTH_PREFIX } from 'src/constants/apiPrefix';

const aiplan = useAiplanStore();
const api = aiplan.api;

export interface IPagination {
  offset: number;
  limit: number;
  order_by: string;
  desc: boolean;
  light?: boolean;
}

export interface ISearchFilters {
  search_query?: string;
  states: string[];
  labels: string[];
  authors: string[];
  projects: string[];
  watchers: string[];
  assignees: string[];
  workspaces: string[];
  priorities: string[];
  only_active: boolean;
  watched_by_me: boolean;
  assigned_to_me: boolean;
}

export const useIssuesStore = defineStore('issues-store', {
  state: () => {
    return {
      personalIssues: [] as any[],
      refreshIssues: false,
    };
  },
  actions: {
    async getIssues(url: string, pagination: IPagination, filters: IIssueFilters) {
      if (url.includes('undefined')) return;
      return await api
        .post(url, filters, {
          params: pagination,
        })
        .then(({ data }) => {
          return {
            rows: data.issues,
            pagination: {
              rowsNumber: data.count,
              rowsPerPage: data.limit,
            },
          };
        });
    },

    async extendedSearchIssues(
      filters: ISearchFilters,
      pagination: IPagination,
    ) {
      try {
        const { data } = await api.post(`${API_AUTH_PREFIX}/issues/search/`, filters, {
          params: pagination,
        });

        return data;
      } catch {}
    },
  },
});
