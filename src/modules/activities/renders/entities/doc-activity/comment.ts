import { i18n } from '@/i18n';
import {
  createActivityMessage,
  createTextPart,
} from '../../activity-message.helpers';
import { createCurrentDocParts } from './doc-message.helpers';

import type { ActivityRenderer } from '../../activity-renderer.types';
import type { MessageKey } from '@/i18n';

const renderDocComment = (messageKey: MessageKey): ActivityRenderer =>
  (activity, context) =>
    createActivityMessage(
      createTextPart(i18n.global.t(messageKey)),
      ...createCurrentDocParts(activity, context),
    );

export const renderDocCommentCreated = renderDocComment(
  'docActivity.commentAdded',
);
export const renderDocCommentUpdated = renderDocComment(
  'docActivity.commentUpdated',
);
export const renderDocCommentDeleted = renderDocComment(
  'docActivity.commentDeleted',
);
