import { renderFormActivity } from './entities/form-activity';
import { renderIssueActivity } from './entities/issue-activity';
import { renderRootActivity } from './entities/root-activity';
import { renderProjectActivity } from './entities/project-activity';
import { renderSprintActivity } from './entities/sprint-activity';
import { renderWorkspaceActivity } from './entities/workspace-activity';

import type { ActivityEntityType } from '../model/activity.types';
import type { ActivityRenderer } from './activity-renderer.types';

export const activityRendererRegistry: Readonly<
  Partial<Record<ActivityEntityType, ActivityRenderer>>
> = {
  form: renderFormActivity,
  issue: renderIssueActivity,
  project: renderProjectActivity,
  root: renderRootActivity,
  sprint: renderSprintActivity,
  workspace: renderWorkspaceActivity,
};
