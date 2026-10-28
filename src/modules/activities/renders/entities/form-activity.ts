import { i18n } from '@/i18n';
import { getActivityVerbText } from '../activity-value.helpers';

import type {
  ActivityMessage,
  ActivityMessagePart,
} from '../activity-renderer.types';
import type { DtoActivityEventFull } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import type { MessageKey } from '@/i18n';

const FORM_ACTION_BY_FIELD: Readonly<Record<string, MessageKey>> = {
  title: 'activities.form.actions.title',
  description: 'activities.form.actions.description',
  end_date: 'activities.form.actions.end_date',
  fields: 'activities.form.actions.fields',
};

const getFormActionTarget = (
  field?: string | null,
): MessageKey | undefined => {
  if (
    !field ||
    !Object.prototype.hasOwnProperty.call(FORM_ACTION_BY_FIELD, field)
  ) {
    return undefined;
  }

  return FORM_ACTION_BY_FIELD[field];
};

const createFormLink = (
  activity: DtoActivityEventFull,
): ActivityMessagePart => {
  const form = activity.form_detail;
  const text = `"${form?.title ?? ''}"`;
  const href = activity.entity_url ?? (form?.slug ? `/f/${form.slug}` : null);

  return href
    ? { type: 'external-link', href, text }
    : { type: 'text', text };
};

export const renderFormActivity = (
  activity: DtoActivityEventFull,
): ActivityMessage => {
  const target = getFormActionTarget(activity.field);
  const action = target
    ? `${getActivityVerbText(activity.verb)} ${i18n.global.t(target)}`
    : `${i18n.global.t('activities.form.fallbackVerb')} ${i18n.global.t(
        'activities.form.defaultTarget',
      )}`;

  return {
    parts: [
      { type: 'text', text: `${action} ` },
      createFormLink(activity),
    ],
  };
};
