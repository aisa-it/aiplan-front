import { isActivityVerb } from '../model/activity.types';

import type { ActivityVerb } from '../model/activity.types';
import type { ActivityRenderer } from './activity-renderer.types';

type ActivityVerbRenderers = Readonly<
  Partial<Record<ActivityVerb, ActivityRenderer>>
>;

type ActivityFieldRenderer = ActivityRenderer | ActivityVerbRenderers;

type ActivityFieldRenderers = Readonly<Record<string, ActivityFieldRenderer>>;

export const createActivityRenderer = (
  fieldRenderers: ActivityFieldRenderers,
): ActivityRenderer => {
  return (activity, context) => {
    const fieldRenderer = activity.field
      ? fieldRenderers[activity.field]
      : undefined;

    if (!fieldRenderer) return null;

    if (typeof fieldRenderer === 'function') {
      return fieldRenderer(activity, context);
    }

    if (!isActivityVerb(activity.verb)) return null;

    return fieldRenderer[activity.verb]?.(activity, context) ?? null;
  };
};
