import {
  createActivityMessage,
  createTextPart,
} from '../../activity-message.helpers';
import { getActivityVerbText } from '../../activity-value.helpers';
import { createDocLink } from '../../entity-link.helpers';
import {
  createCurrentDocParts,
  createDocLocationPart,
} from './doc-message.helpers';

import type { ActivityRenderer } from '../../activity-renderer.types';

export const renderDocMoved: ActivityRenderer = (activity, context) =>
  createActivityMessage(
    createTextPart(`${getActivityVerbText(activity.verb)} документ`),
    ...createCurrentDocParts(activity, context),
    createTextPart(' из '),
    createDocLocationPart(
      activity,
      activity.old_entity_detail,
      activity.old_value,
      'корневой папки',
    ),
    createTextPart(' в '),
    createDocLocationPart(
      activity,
      activity.new_entity_detail,
      activity.new_value,
      'корневую папку',
    ),
  );

export const renderChildDocDeleted: ActivityRenderer = (activity) =>
  createActivityMessage(
    createTextPart(
      `${getActivityVerbText(activity.verb)} дочерний документ ${
        activity.old_value ?? ''
      }`,
    ),
  );

export const renderChildDocRemoved: ActivityRenderer = (activity, context) =>
  createActivityMessage(
    createTextPart(`${getActivityVerbText(activity.verb)} дочерний документ `),
    createDocLink(
      activity,
      activity.old_entity_detail,
      activity.old_value ?? '',
    ),
    createTextPart(' из документа'),
    ...createCurrentDocParts(activity, context),
  );

const createChildDocAddedRenderer = (
  action: 'added' | 'created',
): ActivityRenderer =>
  (activity, context) =>
    createActivityMessage(
      createTextPart(`${getActivityVerbText(action)} дочерний документ `),
      createDocLink(
        activity,
        activity.new_entity_detail,
        activity.new_value ?? '',
      ),
      createTextPart(' в документ'),
      ...createCurrentDocParts(activity, context),
    );

export const renderChildDocAdded = createChildDocAddedRenderer('added');
export const renderChildDocCreated = createChildDocAddedRenderer('created');
