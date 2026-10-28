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

import type { ActivityRenderer } from '../../activity-renderer.types';

export const renderWorkspaceForm: ActivityRenderer = (activity) => {
  const detail = activity.new_entity_detail;
  const title = getDetailString(detail, 'title');
  const slug = getDetailString(detail, 'slug');
  const value = activity.new_value || activity.old_value || '';
  const formLink = title
    ? createExternalLinkPart(
        (slug ? `/f/${slug}` : undefined) ?? activity.entity_url,
        `"${title}"`,
      )
    : createTextPart(`"${value}"`);

  return createActivityMessage(
    createTextPart(
      // «форму» уже переведена в ядре (activities.form.defaultTarget) — переиспользуем
      `${getActivityVerbText(activity.verb)} ${i18n.global.t(
        'activities.form.defaultTarget',
      )} `,
    ),
    formLink,
  );
};
