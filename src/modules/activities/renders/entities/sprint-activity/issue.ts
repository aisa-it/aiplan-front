import { i18n } from '@/i18n';
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
    createTextPart(
      `${getActivityVerbText(activity.verb)} ${i18n.global.t(
        'sprintActivity.relations.to',
      )}`,
    ),
    createSprintLink(activity),
    createTextPart(i18n.global.t('sprintActivity.issueTarget')),
    createSprintIssueLink(activity),
  );

export const renderSprintIssueRemoved: ActivityRenderer = (activity) =>
  createActivityMessage(
    createTextPart(
      `${getActivityVerbText(activity.verb)} ${i18n.global.t(
        'sprintActivity.relations.from',
      )}`,
    ),
    createSprintLink(activity),
    createTextPart(i18n.global.t('sprintActivity.issueTarget')),
    createSprintIssueLink(activity),
  );
