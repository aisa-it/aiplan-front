import { i18n } from '@/i18n';
import {
  createActivityMessage,
  createExternalLinkPart,
  createTextPart,
} from '../../activity-message.helpers';
import {
  getActivityVerbText,
  getDetailString,
} from '../../activity-value.helpers';
import {
  createOptionalIssueLinkParts,
  getChangedDetail,
} from './issue-message.helpers';

import type { ActivityRenderer } from '../../activity-renderer.types';

const renderIssueSprint = (isAdded: boolean): ActivityRenderer => {
  return (activity, context) => {
    const detail = getChangedDetail(activity);
    const id = getDetailString(detail, 'id');
    const name = getDetailString(detail, 'name') ?? '';
    const workspaceSlug = activity.workspace_detail?.slug;
    const href =
      getDetailString(detail, 'url') ??
      (workspaceSlug && id ? `/${workspaceSlug}/sprints/${id}` : undefined);
    const issueParts = createOptionalIssueLinkParts(activity, context);

    return createActivityMessage(
      createTextPart(
        `${getActivityVerbText(activity.verb)} ${i18n.global.t(
          'activities.issue.issueTarget',
        )}`,
      ),
      ...(issueParts.length ? [createTextPart(' '), ...issueParts] : []),
      createTextPart(
        ` ${i18n.global.t(
          isAdded ? 'activities.issue.sprintTo' : 'activities.issue.sprintFrom',
        )} `,
      ),
      createExternalLinkPart(href, `"${name}"`),
    );
  };
};

export const renderIssueSprintAdded = renderIssueSprint(true);

export const renderIssueSprintRemoved = renderIssueSprint(false);
