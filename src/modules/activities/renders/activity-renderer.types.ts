import type { ActivityRenderContext } from '../model/activity.types';

import type { RouteLocationRaw } from 'vue-router';
import type { DtoActivityEventFull } from '@aisa-it/aiplan-api-ts/src/data-contracts';

export interface ActivityTextPart {
  type: 'text';
  text: string;
}

export interface ActivityExternalLinkPart {
  type: 'external-link';
  href: string;
  text: string;
  emphasized?: boolean;
}

export interface ActivityRouteLinkPart {
  type: 'route-link';
  text: string;
  to: RouteLocationRaw;
  emphasized?: boolean;
}

export type ActivityMessagePart =
  | ActivityTextPart
  | ActivityExternalLinkPart
  | ActivityRouteLinkPart;

export interface ActivityMessage {
  parts: readonly ActivityMessagePart[];
}

export type ActivityRenderer = (
  activity: DtoActivityEventFull,
  context: ActivityRenderContext,
) => ActivityMessage | null;
