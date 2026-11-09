import { i18n } from '@/i18n';
import {
  createActivityMessage,
  createTextPart,
} from '../../activity-message.helpers';
import { getDetailString } from '../../activity-value.helpers';
import { createCurrentDocParts } from './doc-message.helpers';

import type { ActivityRenderer } from '../../activity-renderer.types';

export const renderDocAttachmentCreated: ActivityRenderer = (
  activity,
  context,
) => {
  const assetName =
    getDetailString(activity.new_entity_detail?.asset, 'name') ??
    activity.new_value ??
    '';

  return createActivityMessage(
    createTextPart(
      i18n.global.t('docActivity.attachmentAdded', { value: assetName }),
    ),
    ...createCurrentDocParts(activity, context),
  );
};

export const renderDocAttachmentDeleted: ActivityRenderer = (
  activity,
  context,
) =>
  createActivityMessage(
    createTextPart(
      i18n.global.t('docActivity.attachmentDeleted', {
        value: activity.old_value ?? '',
      }),
    ),
    ...createCurrentDocParts(activity, context),
  );
