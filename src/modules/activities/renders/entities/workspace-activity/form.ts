import {
  createActivityMessage,
  createExternalLinkPart,
  createTextPart,
} from '../../activity-message.helpers';
import {
  getActivityVerbText,
  getDetailString,
} from '../../activity-value.helpers';

import type { ActivityRenderer } from '../../activity-renderer.types';

export const renderWorkspaceForm: ActivityRenderer = (activity) => {
  const detail = activity.new_entity_detail;
  const title = getDetailString(detail, 'title');
  const slug = getDetailString(detail, 'slug');
  const value = activity.new_value || activity.old_value || '';
  const formLink = title
    ? createExternalLinkPart(
        activity.entity_url ?? (slug ? `/f/${slug}` : undefined),
        `"${title}"`,
      )
    : createTextPart(`"${value}"`);

  return createActivityMessage(
    createTextPart(`${getActivityVerbText(activity.verb)} форму `),
    formLink,
  );
};
