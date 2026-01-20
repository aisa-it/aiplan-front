import { getFullName } from 'src/utils/helpers';

const link = (href: string, text: string) => `<a target="_blank"
                    style="color: #3F76FF; text-decoration: none; font-weight: 400;"
                    href=${href}>
                    ${text}<a/>`;

export function sprintNotificationRender(data: any) {
  const sprintDetail = data?.sprint_activity_detail || data?.sprint_detail || null;
  const sprintName = sprintDetail?.name || data?.sprint_name || data?.sprint || data?.sprint_id || '';
  const sprintLink = sprintDetail?.url
    ? link(sprintDetail.url, `${sprintName}`)
    : sprintName
      ? `"${sprintName}"`
      : '';

  const issueEntity =
    data?.verb === 'removed' ? data?.old_entity_detail : data?.new_entity_detail;
  const issueKey = data?.verb === 'removed' ? data?.old_value : data?.new_value;
  const issueName = issueEntity?.name || '';
  const issueLink = issueEntity?.url
    ? link(issueEntity.url, `${issueKey ? issueKey + ' ' : ''}"${issueName}"`)
    : issueKey
      ? `"${issueKey}"`
      : issueName
        ? `"${issueName}"`
        : '';

  switch (data?.field) {
    case 'sprint':
      if (data?.verb === 'created') return `создал(-а) спринт ${sprintLink}`;
      if (data?.verb === 'deleted') return `удалил(-а) спринт ${sprintLink || data?.old_value}`;
      break;

    case 'name':
    case 'sprint_name':
      if (data?.verb === 'updated') {
        return `обновил(-а) название спринта ${sprintLink || ''}`;
      }
      break;

    case 'description':
    case 'sprint_description':
      if (data?.verb === 'updated') {
        return `обновил(-а) описание спринта ${sprintLink || ''}`;
      }
      break;

    case 'start_date':
    case 'sprint_start':
      if (data?.verb === 'updated') {
        return `изменил(-а) дату начала спринта ${sprintLink || ''}`;
      }
      break;

    case 'end_date':
    case 'sprint_end':
      if (data?.verb === 'updated') {
        return `изменил(-а) дату конца спринта ${sprintLink || ''}`;
      }
      break;

    case 'sprint_date':
      if (data?.verb === 'updated') {
        return `изменил(-а) даты спринта ${sprintLink || ''}`;
      }
      break;

    case 'issue_list':
    case 'issues':
    case 'issue':
      if (data?.verb === 'added') {
        return `добавил(-а) задачу ${issueLink || ''} в спринт ${sprintLink || ''}`;
      }
      if (data?.verb === 'removed') {
        return `убрал(-а) задачу ${issueLink || ''} из спринта ${sprintLink || ''}`;
      }
      break;

    case 'watcher_list':
    case 'watchers':
      if (data?.verb === 'added') {
        return `добавил(-а) наблюдателя ${getFullName(
          data.new_entity_detail,
        )} в спринт ${sprintLink || ''}`;
      }
      if (data?.verb === 'removed') {
        return `убрал(-а) наблюдателя ${getFullName(
          data.old_entity_detail,
        )} из спринта ${sprintLink || ''}`;
      }
      break;
  }

  return '';
}

