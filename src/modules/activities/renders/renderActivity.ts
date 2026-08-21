import { isActivityEntityType } from '../model/activity.types';
import { activityRendererRegistry } from './activity-renderer.registry';

import type { ActivityRenderContext } from '../model/activity.types';
import type { ActivityMessage } from './activity-renderer.types';
import type { DtoActivityEventFull } from '@aisa-it/aiplan-api-ts/src/data-contracts';

const DEFAULT_RENDER_CONTEXT: ActivityRenderContext = {
  placement: 'aggregate',
};

export const renderActivity = (
  source: DtoActivityEventFull,
  context: ActivityRenderContext = DEFAULT_RENDER_CONTEXT,
): ActivityMessage | null => {
  if (!isActivityEntityType(source.entity_type)) return null;

  const renderer = activityRendererRegistry[source.entity_type];

  return renderer?.(source, context) ?? null;
};
