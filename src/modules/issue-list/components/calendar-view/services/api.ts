import { Issues } from '@aisa-it/aiplan-api-ts/src/Issues';
import { withInterceptors } from 'src/utils/interceptorsWithInstanceClass';
import {
  DtoIssueWithCount,
  TypesIssuesListFilters,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';

const issuesApi = new (withInterceptors(Issues))();

export const api = {
  getIssues: async (
    filters: TypesIssuesListFilters,
    query?: {
      hide_sub_issues?: boolean;
      order_by?: string;
      group_by?: string;
      offset?: number;
      limit?: number;
      desc?: boolean;
      only_count?: boolean;
      only_active?: boolean;
      only_pinned?: boolean;
      stream?: boolean;
    },
  ): Promise<DtoIssueWithCount[]> => {
    return issuesApi
      .getIssueList(filters, query)
      .then((res) => res.data.issues ?? []);
  },
};
