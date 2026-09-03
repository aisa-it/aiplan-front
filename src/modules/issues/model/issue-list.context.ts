import { inject, provide, type InjectionKey } from 'vue';

import type { IssueListController } from './useIssueListController';

const ISSUE_LIST_CONTROLLER_KEY: InjectionKey<IssueListController> = Symbol(
  'issue-list-controller',
);

export const provideIssueListController = (controller: IssueListController) =>
  provide(ISSUE_LIST_CONTROLLER_KEY, controller);

export const useIssueListControllerContext = () => {
  const controller = inject(ISSUE_LIST_CONTROLLER_KEY);

  if (!controller) {
    throw new Error('Issue list controller was not provided');
  }

  return controller;
};
