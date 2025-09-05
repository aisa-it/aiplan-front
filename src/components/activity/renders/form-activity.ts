import { DtoEntityActivityFull } from '@aisa-it/aiplan-api-ts/src/data-contracts';

export function formActivityRender(activity: DtoEntityActivityFull) {
  let action = '';
  const formLink = `<a target="_blank"
                    style="color: #3F76FF; text-decoration: none; font-weight: 400;"
                    href=${
                      activity?.entity_url ??
                      `/f/${activity?.form_detail?.slug}`
                    }>
                    "${activity?.form_detail?.title}"<a/>`;

  switch (activity.field) {
    case 'title':
      action = 'обновил(-а) название в форме';
      return `<span>${action} ${formLink}<span/>`;

    case 'description':
      action = 'обновил(-а) описание в форме';
      return `<span>${action} ${formLink}<span/>`;

    case 'end_date':
      action = 'обновил(-а) дату окончания в форме';
      return `<span>${action} ${formLink}<span/>`;

    case 'fields':
      action = 'обновил(-а) поля в форме';
      return `<span>${action} ${formLink}<span/>`;

    default:
      action = 'обновил(-а) форму';
      return `<span>${action} ${formLink}<span/>`;
  }
}
