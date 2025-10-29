import { defineStore } from 'pinia';
import { useAiplanStore } from './aiplan-store';
import { IIssueFilters } from 'src/interfaces/issues';
import {
  API_AUTH_PREFIX,
  API_WORKSPACES_PREFIX,
} from 'src/constants/apiPrefix';

import { Issues } from '@aisa-it/aiplan-api-ts/src/Issues';
import { withInterceptors } from 'src/utils/interceptorsWithInstanceClass';
import { TypesIssuesListFilters } from '@aisa-it/aiplan-api-ts/src/data-contracts';

const issuesApi = new (withInterceptors(Issues))();

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

export interface IQuery {
  show_sub_issues?: boolean;
  order_by?: string;
  offset?: number;
  limit?: number;
  desc?: boolean;
  only_count?: boolean;
  group_by?: string;
}

export const useIssuesStore = defineStore('issues-store', {
  state: () => {
    return {
      personalIssues: [] as any[],
      refreshIssues: false,
      groupedIssueList: [],
      groupByIssues: '',
      ungroupedIssueList: [],
    };
  },
  actions: {
    async getIssues(
      url: string,
      pagination: IPagination,
      filters: IIssueFilters,
    ) {
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
        const { data } = await api.post(
          `${API_AUTH_PREFIX}/issues/search/`,
          filters,
          {
            params: pagination,
          },
        );

        return data;
      } catch {}
    },
    async getIssueList(filters: TypesIssuesListFilters, query: IQuery) {
      return issuesApi.getIssueList(filters, query);
    },

    async getIssuesTable(
      workspaceSlug: string,
      projectId: string,
      filters: TypesIssuesListFilters,
      query: IQuery,
    ) {
      try {
        const response = await api.post(
          `${API_WORKSPACES_PREFIX}/${workspaceSlug}/projects/${projectId}/issues/search`,
          filters,
          { params: query },
        );
        return response;
      } catch {}
    },
  },
});
