import { inject, provide, type InjectionKey } from 'vue';

import type { IssueListController } from '../composables/useIssueListController';

const ISSUE_LIST_CONTROLLER_KEY: InjectionKey<IssueListController> = Symbol(
  'issue-list-controller',
);

type IssueEditorActions = Pick<
  IssueListController,
  'canEditField' | 'updateIssue' | 'getAvailableStates'
>;
const ISSUE_EDITOR_ACTIONS_KEY: InjectionKey<IssueEditorActions> = Symbol('issue-editor-actions');

export const provideIssueEditorActions = (actions: IssueEditorActions) =>
  provide(ISSUE_EDITOR_ACTIONS_KEY, actions);

export const useIssueEditorActions = () => {
  const actions = inject(ISSUE_EDITOR_ACTIONS_KEY);
  if (!actions) throw new Error('Issue editor actions were not provided');
  return actions;
};

export const provideIssueListController = (controller: IssueListController) => {
  provide(ISSUE_LIST_CONTROLLER_KEY, controller);
  provideIssueEditorActions(controller);
};

export const useIssueListControllerContext = () => {
  const controller = inject(ISSUE_LIST_CONTROLLER_KEY);

  if (!controller) {
    throw new Error('Issue list controller was not provided');
  }

  return controller;
};
