import { i18n } from '@/i18n';
import { isActivityEntityType } from '../model/activity.types';
import {
  createActivityMessage,
  createTextPart,
} from './activity-message.helpers';
import { activityRendererRegistry } from './activity-renderer.registry';

import type { ActivityRenderContext } from '../model/activity.types';
import type { ActivityMessage } from './activity-renderer.types';
import type { DtoActivityEventFull } from '@aisa-it/aiplan-api-ts/src/data-contracts';

const DEFAULT_RENDER_CONTEXT: ActivityRenderContext = {
  scope: 'overview',
};

const renderFallbackActivity = (
  source: DtoActivityEventFull,
): ActivityMessage =>
  createActivityMessage(
    createTextPart(
      i18n.global.t('activities.fallback', {
        entity: source.entity_type || '—',
        field: source.field || '—',
        verb: source.verb || '—',
      }),
    ),
  );

export const renderActivity = (
  source: DtoActivityEventFull,
  context: ActivityRenderContext = DEFAULT_RENDER_CONTEXT,
): ActivityMessage => {
  if (!isActivityEntityType(source.entity_type)) {
    return renderFallbackActivity(source);
  }

  const renderer = activityRendererRegistry[source.entity_type];

  return renderer(source, context) ?? renderFallbackActivity(source);
};
