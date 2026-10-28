import { i18n } from '@/i18n';
import {
  createActivityMessage,
  createTextPart,
} from '../../activity-message.helpers';
import { getRoleText } from '../../activity-value.helpers';
import { createCurrentDocParts } from './doc-message.helpers';

import type { ActivityRenderer } from '../../activity-renderer.types';
import type { MessageKey } from '@/i18n';

const renderDocProperty = (
  labelKey: MessageKey,
): ActivityRenderer =>
  (activity, context) =>
    createActivityMessage(
      createTextPart(
        i18n.global.t('activities.doc.changedField', {
          target: i18n.global.t(labelKey),
        }),
      ),
      ...createCurrentDocParts(activity, context),
    );

const renderDocRole = (
  roleKey: MessageKey,
): ActivityRenderer =>
  (activity, context) =>
    createActivityMessage(
      createTextPart(
        i18n.global.t('activities.doc.roleChanged', {
          target: i18n.global.t(roleKey),
        }),
      ),
      ...createCurrentDocParts(activity, context),
      createTextPart(
        ` ${i18n.global.t('activities.doc.fromToQuoted', {
          previous: getRoleText(activity.old_value),
          next: getRoleText(activity.new_value),
        })}`,
      ),
    );

export const renderDocDescription = renderDocProperty(
  'activities.doc.fields.description',
);
export const renderDocTitle = renderDocProperty(
  'activities.doc.fields.title',
);
export const renderDocReaderRole = renderDocRole(
  'activities.doc.roles.read',
);
export const renderDocEditorRole = renderDocRole(
  'activities.doc.roles.edit',
);

export const renderDocSort: ActivityRenderer = (activity, context) =>
  createActivityMessage(
    createTextPart(i18n.global.t('activities.doc.sortedChildDocs')),
    ...createCurrentDocParts(activity, context),
  );
