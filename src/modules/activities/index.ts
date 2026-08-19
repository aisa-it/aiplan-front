export { default as ActivityMessage } from './ui/ActivityMessage.vue';
export { default as ActivitiesList } from './ui/ActivitiesList.vue';

export { renderActivity } from './rendering/renderActivity';

export type {
  ActivitiesListRequest,
  ActivityEntityReference,
  ActivityEntityType,
  ActivityPlacement,
  ActivityRenderContext,
} from './model/activity.types';
export type {
  ActivityMessage as ActivityMessageModel,
  ActivityMessagePart,
  ActivityRenderer,
} from './rendering/activity-renderer.types';
