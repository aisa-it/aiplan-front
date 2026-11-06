import { i18n } from '@/i18n';
import { createTextPart } from '../../activity-message.helpers';
import { createDocLink } from '../../entity-link.helpers';

import type { ActivityRenderContext } from '../../../model/activity.types';
import type { ActivityMessagePart } from '../../activity-renderer.types';
import type { DtoActivityEventFull } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import type { MessageKey } from '@/i18n';

const isCurrentDoc = (context: ActivityRenderContext) =>
  context.scope === 'entity' && context.entity.type === 'doc';

export const createCurrentDocParts = (
  activity: DtoActivityEventFull,
  context: ActivityRenderContext,
): ActivityMessagePart[] =>
  isCurrentDoc(context)
    ? []
    : [
        createTextPart(' '),
        createDocLink(
          activity,
          activity.doc_detail,
          activity.doc_detail?.title
            ? `"${activity.doc_detail.title}"`
            : '',
        ),
      ];

export const createDocLocationPart = (
  activity: DtoActivityEventFull,
  detail: unknown,
  value: string | undefined,
  rootKey: MessageKey,
): ActivityMessagePart =>
  value === activity.workspace_detail?.name
    ? createTextPart(i18n.global.t(rootKey))
    : createDocLink(activity, detail, value ?? '');
