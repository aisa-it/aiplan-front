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
      createTextPart(`${getActivityVerbText(activity.verb)} задачу`),
      ...(issueParts.length ? [createTextPart(' '), ...issueParts] : []),
      createTextPart(` ${isAdded ? 'в спринт' : 'из спринта'} `),
      createExternalLinkPart(href, `"${name}"`),
    );
  };
};

export const renderIssueSprintAdded = renderIssueSprint(true);

export const renderIssueSprintRemoved = renderIssueSprint(false);
