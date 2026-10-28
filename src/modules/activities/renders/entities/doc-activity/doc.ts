import { i18n } from '@/i18n';
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
    createTextPart(
      `${getActivityVerbText(activity.verb)} ${i18n.global.t(
        'activities.doc.docTarget',
      )}`,
    ),
    ...createCurrentDocParts(activity, context),
    createTextPart(i18n.global.t('activities.doc.moveFrom')),
    createDocLocationPart(
      activity,
      activity.old_entity_detail,
      activity.old_value,
      'activities.doc.rootFolderFrom',
    ),
    createTextPart(i18n.global.t('activities.doc.moveTo')),
    createDocLocationPart(
      activity,
      activity.new_entity_detail,
      activity.new_value,
      'activities.doc.rootFolderTo',
    ),
  );

export const renderChildDocDeleted: ActivityRenderer = (activity) =>
  createActivityMessage(
    createTextPart(
      `${getActivityVerbText(activity.verb)} ${i18n.global.t(
        'activities.doc.childDoc',
      )} ${activity.old_value ?? ''}`,
    ),
  );

export const renderChildDocRemoved: ActivityRenderer = (activity, context) =>
  createActivityMessage(
    createTextPart(
      `${getActivityVerbText(activity.verb)} ${i18n.global.t(
        'activities.doc.childDoc',
      )} `,
    ),
    createDocLink(
      activity,
      activity.old_entity_detail,
      activity.old_value ?? '',
    ),
    createTextPart(i18n.global.t('activities.doc.removedFromDoc')),
    ...createCurrentDocParts(activity, context),
  );

const createChildDocAddedRenderer = (
  action: 'added' | 'created',
): ActivityRenderer =>
  (activity, context) =>
    createActivityMessage(
      createTextPart(
        `${getActivityVerbText(action)} ${i18n.global.t(
          'activities.doc.childDoc',
        )} `,
      ),
      createDocLink(
        activity,
        activity.new_entity_detail,
        activity.new_value ?? '',
      ),
      createTextPart(i18n.global.t('activities.doc.addedToDoc')),
      ...createCurrentDocParts(activity, context),
    );

export const renderChildDocAdded = createChildDocAddedRenderer('added');
export const renderChildDocCreated = createChildDocAddedRenderer('created');
