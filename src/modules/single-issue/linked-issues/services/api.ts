import {
  DtoIssue,
  DtoIssueLight,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { withInterceptors } from 'src/utils/interceptorsWithInstanceClass';
import { Issues } from '@aisa-it/aiplan-api-ts/src/Issues';

const api = new (withInterceptors(Issues))();
type AddIssueLinkedIssueListArgs = Parameters<
  typeof api.addIssueLinkedIssueList
>;
type GetLinkedIssuesArgs = Parameters<typeof api.getIssueLinkedIssueList>;
type GetAvailableLinkedIssuesArgs = Parameters<
  typeof api.getAvailableLinkedIssueList
>;

export const getLinkedIssues = async (
  ...body: GetLinkedIssuesArgs
): Promise<DtoIssue[]> => {
  const { data } = await api.getIssueLinkedIssueList(...body);
  return data;
};

export const addIssueLinkedIssueList = async (
  ...body: AddIssueLinkedIssueListArgs
): Promise<DtoIssueLight[]> => {
  const { data } = await api.addIssueLinkedIssueList(...body);
  return data;
};

export const getAvailableLinkedIssues = async (
  ...body: GetAvailableLinkedIssuesArgs
) => {
  const { data } = await api.getAvailableLinkedIssueList(...body);
  return data;
};
