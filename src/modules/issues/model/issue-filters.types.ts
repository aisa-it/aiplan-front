import type { TypesViewProps } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import type { IssueColumnKey } from './issue-list.types';

export interface IssueFilterOption<T extends string = string> {
  title: string;
  value: T;
}

export interface IssueFilterColumnOption {
  key: IssueColumnKey;
  title: string;
}

export type IssueViewOption = IssueFilterOption<
  NonNullable<TypesViewProps['issueView']>
>;

export type IssueDisplayToggleKey =
  | 'hideSubIssues'
  | 'draft'
  | 'showEmptyGroups'
  | 'showOnlyActive';

export type IssuePersonalToggleKey =
  | 'assignedToMe'
  | 'watchedToMe'
  | 'authoredToMe';

export interface IssueFilterToggle<Key extends string> {
  key: Key;
  label: string;
}
