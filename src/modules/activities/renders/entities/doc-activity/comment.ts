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
  'activities.doc.commentAdded',
);
export const renderDocCommentUpdated = renderDocComment(
  'activities.doc.commentUpdated',
);
export const renderDocCommentDeleted = renderDocComment(
  'activities.doc.commentDeleted',
);
