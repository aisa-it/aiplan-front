import type {
  ActivityMessage,
  ActivityMessagePart,
} from '../activity-renderer.types';
import type { DtoActivityEventFull } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { getActivityVerbText } from '../activity-value.helpers';

const FORM_ACTION_BY_FIELD: Readonly<Record<string, string>> = {
  title: 'название в форме',
  description: 'описание в форме',
  end_date: 'дату окончания в форме',
  fields: 'поля в форме',
};

const DEFAULT_FORM_ACTION = 'форму';

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
  const target =
    (activity.field && FORM_ACTION_BY_FIELD[activity.field]) ??
    DEFAULT_FORM_ACTION;
  const action = getActivityVerbText(activity.verb);

  return {
    parts: [
      { type: 'text', text: `${action} ${target} ` },
      createFormLink(activity),
    ],
  };
};
