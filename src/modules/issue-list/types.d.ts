import { DtoIssue } from '@aisa-it/aiplan-api-ts/src/data-contracts';

export interface IGroupedResponse {
  entity: any;
  issues: DtoIssue[];
  count: number;
}
