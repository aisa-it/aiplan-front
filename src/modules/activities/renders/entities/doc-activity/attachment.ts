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
    createTextPart(`добавил(-а) вложение ${assetName} в документ`),
    ...createCurrentDocParts(activity, context),
  );
};

export const renderDocAttachmentDeleted: ActivityRenderer = (
  activity,
  context,
) =>
  createActivityMessage(
    createTextPart(
      `удалил(-а) вложение ${activity.old_value ?? ''} в документе`,
    ),
    ...createCurrentDocParts(activity, context),
  );
