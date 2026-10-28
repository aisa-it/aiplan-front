import { i18n } from '@/i18n';
import {
  createActivityMessage,
  createTextPart,
} from '../../activity-message.helpers';
import { getDetailString } from '../../activity-value.helpers';
import { createProjectContextParts } from './project-message.helpers';

import type { ActivityRenderer } from '../../activity-renderer.types';
import type { MessageKey } from '@/i18n';

const STATUS_GROUP_KEY: Readonly<Record<string, MessageKey>> = {
  backlog: 'activities.project.statusGroups.backlog',
  unstarted: 'activities.project.statusGroups.unstarted',
  started: 'activities.project.statusGroups.started',
  completed: 'activities.project.statusGroups.completed',
  cancelled: 'activities.project.statusGroups.cancelled',
};

const getStatusGroupText = (value?: string) => {
  const key = value ? STATUS_GROUP_KEY[value.toLowerCase()] : undefined;

  return key ? i18n.global.t(key) : (value ?? '');
};

const renderStatusProperty = (
  labelKey: MessageKey,
  formatValue: (value?: string) => string = (value) => value ?? '',
): ActivityRenderer => {
  return (activity, context) =>
    createActivityMessage(
      createTextPart(
        i18n.global.t('activities.project.changedField', {
          target: i18n.global.t(labelKey),
        }),
      ),
      createTextPart(
        ` ${i18n.global.t('activities.project.fromToQuoted', {
          previous: formatValue(activity.old_value),
          next: formatValue(activity.new_value),
        })}`,
      ),
      ...createProjectContextParts(activity, context, 'at'),
    );
};

export const renderStatusCreated: ActivityRenderer = (activity, context) =>
  createActivityMessage(
    createTextPart(
      i18n.global.t('activities.project.statusCreated', {
        value: activity.new_value ?? '',
      }),
    ),
    ...createProjectContextParts(activity, context, 'into'),
  );

export const renderStatusDeleted: ActivityRenderer = (activity, context) =>
  createActivityMessage(
    createTextPart(
      i18n.global.t('activities.project.statusDeleted', {
        value: activity.old_value ?? '',
      }),
    ),
    ...createProjectContextParts(activity, context, 'from'),
  );

export const renderDefaultStatus: ActivityRenderer = (activity, context) =>
  createActivityMessage(
    createTextPart(
      i18n.global.t('activities.project.defaultStatusChanged', {
        previous: activity.old_value ?? '',
        next: activity.new_value ?? '',
      }),
    ),
    ...createProjectContextParts(activity, context, 'at'),
  );

export const renderStatusName = renderStatusProperty(
  'activities.project.fields.statusName',
);

export const renderStatusDescription: ActivityRenderer = (
  activity,
  context,
) =>
  createActivityMessage(
    createTextPart(
      i18n.global.t('activities.project.statusDescriptionChanged', {
        name: getDetailString(activity.new_entity_detail, 'name') ?? '',
        previous:
          activity.old_value || i18n.global.t('activities.project.noDescription'),
        next:
          activity.new_value || i18n.global.t('activities.project.noDescription'),
      }),
    ),
    ...createProjectContextParts(activity, context, 'at'),
  );

export const renderStatusGroup: ActivityRenderer = (
  activity,
  context,
) =>
  createActivityMessage(
    createTextPart(
      i18n.global.t('activities.project.statusGroupChanged', {
        name: getDetailString(activity.new_entity_detail, 'name') ?? '',
        previous: getStatusGroupText(activity.old_value),
        next: getStatusGroupText(activity.new_value),
      }),
    ),
    ...createProjectContextParts(activity, context, 'at'),
  );

export const renderStatusColor: ActivityRenderer = (activity, context) =>
  createActivityMessage(
    createTextPart(
      i18n.global.t('activities.project.statusColorChanged', {
        name: getDetailString(activity.new_entity_detail, 'name') ?? '',
        previous: activity.old_value ?? '',
        next: activity.new_value ?? '',
      }),
    ),
    ...createProjectContextParts(activity, context, 'at'),
  );

export const renderStatusDefault = renderStatusProperty(
  'activities.project.fields.defaultStatus',
);
