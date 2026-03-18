import {
  DtoProjectMemberLight,
  DtoWorkspaceMemberLight,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';

export interface Pagination {
  offset?: number;
  limit: number;
  order_by?: string;
  desc?: boolean;
}

export type Member = DtoProjectMemberLight | DtoWorkspaceMemberLight;
