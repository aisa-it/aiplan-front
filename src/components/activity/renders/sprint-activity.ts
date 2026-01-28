import { DtoEntityActivityFull } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import aiplan from 'src/utils/aiplan';
import { translateAction } from './actionTranslations';

export function sprintActivityRender(activity: DtoEntityActivityFull) {
  let action = '';
  let value = '';

  function createSprintLink(sprintName: string) {
    if (activity.sprint_detail?.id) {
      return `<a target="_blank"
                    style="color: #3F76FF; text-decoration: none; font-weight: 600;"
                    href=${`/${activity.workspace_detail?.slug}/sprints/${activity.sprint_detail.id}`}>
                    "${sprintName}"<a/>`;
    }
    return `"${sprintName}"`;
  }

  const sprintLink = createSprintLink(activity.sprint_detail?.name || '');

  switch (activity.field) {
    case 'name':
      return `<span>изменил(-а) название в спринте ${sprintLink}<span/>`;

    case 'description':
      return `<span>изменил(-а) описание в спринте ${sprintLink}<span/>`;

    case 'issue':
    case 'issues': {
      action = translateAction('issues', Boolean(activity.new_value));

      const issueEntity =
        activity?.verb === 'removed'
          ? activity?.old_entity_detail
          : activity?.new_entity_detail;
      const issueKey =
        activity?.verb === 'removed' ? activity?.old_value : activity?.new_value;
      const issueName = issueEntity?.name || '';

      const issueLink = issueEntity?.url
        ? `<a target="_blank"
                    style="color: #3F76FF; text-decoration: none; font-weight: 600;"
                    href=${issueEntity.url}>
                    ${issueKey ? issueKey + ' ' : ''}"${issueName}"<a/>`
        : issueKey
          ? `"${issueKey}"`
          : issueName
            ? `"${issueName}"`
            : '';

      return `<span>${action} ${issueLink || ''} ${
        activity?.verb === 'added' ? 'в спринт' : 'из спринта'
      } ${sprintLink}<span/>`;
    }

    case 'watchers':
      const entityDetail = activity.new_value
        ? activity.new_entity_detail
        : activity.old_entity_detail;
      action = translateAction('watchers', Boolean(activity.new_value));
      value = aiplan.UserName(entityDetail).join(' ');
      return `<span>${action} ${value} ${activity.new_value ? 'в спринт' : 'из спринта'} ${sprintLink}<span/>`;

    case 'start_date':
      return `<span>изменил(-а) дату начала спринта ${sprintLink}<span/>`;

    case 'end_date':
      return `<span>изменил(-а) дату конца спринта ${sprintLink}<span/>`;

    default:
      break;
  }
}
