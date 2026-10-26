import {
  createActivityMessage,
  createTextPart,
} from '../../activity-message.helpers';
import { createCurrentDocParts } from './doc-message.helpers';

import type { ActivityRenderer } from '../../activity-renderer.types';

const renderDocComment = (action: string): ActivityRenderer =>
  (activity, context) =>
    createActivityMessage(
      createTextPart(`${action} комментарий в документе`),
      ...createCurrentDocParts(activity, context),
    );

export const renderDocCommentCreated = renderDocComment('добавил(-а)');
export const renderDocCommentUpdated = renderDocComment('изменил(-а)');
export const renderDocCommentDeleted = renderDocComment('удалил(-а)');
