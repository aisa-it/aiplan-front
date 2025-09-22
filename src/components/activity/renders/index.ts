import { issueActivityRender } from './issue-activity';
import { projectActivityRender } from './project-activity';
import { workspaceActivityRender } from './workspace-activity';
import { formActivityRender } from './form-activity';

import { DtoEntityActivityFull } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { docActivityRender } from './doc-activity';

export function activityRender(
  activity: DtoEntityActivityFull,
  isOnlyProject: boolean,
  isOnlyWorkspace: boolean,
) {
  switch (activity.entity_type) {
    case 'form':
      return formActivityRender(activity);
    case 'issue':
      return issueActivityRender(activity, isOnlyWorkspace);
    case 'workspace':
      return workspaceActivityRender(activity, isOnlyWorkspace);
    case 'project':
      return projectActivityRender(activity, isOnlyProject, isOnlyWorkspace);
    case 'doc':
      return docActivityRender(activity);
  }
}
