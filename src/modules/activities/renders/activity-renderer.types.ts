import type { ActivityRenderContext } from '../model/activity.types';

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

export type ActivityMessagePart =
  | ActivityTextPart
  | ActivityExternalLinkPart;

export interface ActivityMessage {
  parts: readonly ActivityMessagePart[];
}

export type ActivityRenderer = (
  activity: DtoActivityEventFull,
  context: ActivityRenderContext,
) => ActivityMessage | null;
