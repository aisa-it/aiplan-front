import { renderFormActivity } from './entities/form-activity';
import { renderRootActivity } from './entities/root-activity';
import { renderProjectActivity } from './entities/project';
import { renderWorkspaceActivity } from './entities/workspace';

import type { ActivityEntityType } from '../model/activity.types';
import type { ActivityRenderer } from './activity-renderer.types';

export const activityRendererRegistry: Readonly<
  Partial<Record<ActivityEntityType, ActivityRenderer>>
> = {
  form: renderFormActivity,
  project: renderProjectActivity,
  root: renderRootActivity,
  workspace: renderWorkspaceActivity,
};
