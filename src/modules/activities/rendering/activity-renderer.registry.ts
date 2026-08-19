import { renderFormActivity } from './entities/form-activity';

import type { ActivityEntityType } from '../model/activity.types';
import type { ActivityRenderer } from './activity-renderer.types';

export const activityRendererRegistry: Readonly<
  Partial<Record<ActivityEntityType, ActivityRenderer>>
> = {
  form: renderFormActivity,
};
