import {
  createActivityMessage,
  createTextPart,
} from '../../activity-message.helpers';
import { getActivityVerbText } from '../../activity-value.helpers';
import {
  createSprintIssueLink,
  createSprintLink,
} from './sprint-message.helpers';

import type { ActivityRenderer } from '../../activity-renderer.types';

export const renderSprintIssueAdded: ActivityRenderer = (activity) =>
  createActivityMessage(
    createTextPart(`${getActivityVerbText(activity.verb)} в спринт `),
    createSprintLink(activity),
    createTextPart(' задачу '),
    createSprintIssueLink(activity),
  );

export const renderSprintIssueRemoved: ActivityRenderer = (activity) =>
  createActivityMessage(
    createTextPart(`${getActivityVerbText(activity.verb)} из спринта `),
    createSprintLink(activity),
    createTextPart(' задачу '),
    createSprintIssueLink(activity),
  );
