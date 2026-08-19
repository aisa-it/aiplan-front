import type {
  ActivityMessage,
  ActivityMessagePart,
} from '../activity-renderer.types';
import type { DtoActivityEventFull } from '@aisa-it/aiplan-api-ts/src/data-contracts';

const FORM_ACTION_BY_FIELD: Readonly<Record<string, string>> = {
  title: 'обновил(-а) название в форме',
  description: 'обновил(-а) описание в форме',
  end_date: 'обновил(-а) дату окончания в форме',
  fields: 'обновил(-а) поля в форме',
};

const DEFAULT_FORM_ACTION = 'обновил(-а) форму';

const createFormReference = (
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
  const action =
    (activity.field && FORM_ACTION_BY_FIELD[activity.field]) ??
    DEFAULT_FORM_ACTION;

  return {
    parts: [
      { type: 'text', text: `${action} ` },
      createFormReference(activity),
    ],
  };
};
