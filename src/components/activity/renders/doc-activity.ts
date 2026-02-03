import { DtoEntityActivityFull } from '@aisa-it/aiplan-api-ts/src/data-contracts';

export function getURLDoc(
  activity: DtoEntityActivityFull,
  field: 'new_entity_detail' | 'old_entity_detail',
  fallback: string = '',
) {
  if (!activity?.[field]) return fallback;
  return `<a target="_blank"
                    style="color: #3F76FF; text-decoration: none; font-weight: 400;"
                    href=${`/${activity.workspace_detail?.slug}/aidoc/${activity?.[field]?.id}`}>
                    "${activity?.[field]?.title}"<a/>`;
}

export function docActivityRender(activity: DtoEntityActivityFull) {
  function createDocLink(entityDetail: any, fallback: string = '') {
    if (!entityDetail) return fallback;

    return `<a target="_blank"
                    style="color: #3F76FF; text-decoration: none; font-weight: 400;"
                    href=${`/${activity.workspace_detail?.slug}/aidoc/${entityDetail.id}`}>
                    "${entityDetail.title}"<a/>`;
  }

  function createLinkByDocDetail() {
    return createDocLink(activity.doc_detail);
  }

  switch (activity.field) {
    case 'description':
      return `<span>изменил(-а) описание документа ${createLinkByDocDetail()}<span/>`;
    case 'title':
      return `<span>изменил(-а) название документа ${createLinkByDocDetail()}<span/>`;
    case 'attachment':
      switch (activity.verb) {
        case 'created':
          return `<span>добавил(-а) вложение ${
            activity.new_entity_detail?.asset?.name || activity.new_value
          } в документ ${createLinkByDocDetail()}<span/>`;
        case 'deleted':
          return `<span>удалил(-а) вложение ${
            activity.old_value
          } в документе ${createLinkByDocDetail()}<span/>`;
      }
    case 'comment':
      switch (activity.verb) {
        case 'created':
          return `<span>добавил(-а) комментарий в документ ${createLinkByDocDetail()}<span/>`;
        case 'updated':
          return `<span>изменил(-а) комментарий в документе ${createLinkByDocDetail()}<span/>`;
        case 'deleted':
          return `<span>удалил(-а) комментарий в документе ${createLinkByDocDetail()}<span/>`;
      }
    case 'doc':
      switch (activity.verb) {
        case 'move_workspace_to_doc':
        case 'move_doc_to_workspace':
        case 'move_doc_to_doc':
        case 'move':
          return `<span>перенес(-ла) документ ${createLinkByDocDetail()} из ${
            activity.old_value === activity.workspace_detail?.name
              ? 'корневой папки'
              : createDocLink(
                  activity.old_entity_detail,
                  activity.old_value ?? '',
                )
          } в ${
            activity.new_value === activity.workspace_detail?.name
              ? 'корневую папку'
              : createDocLink(
                  activity.new_entity_detail,
                  activity.new_value ?? '',
                )
          }<span/>`;
        case 'deleted':
          return `удалил(-а) дочерний документ ${activity.old_value}`;
        case 'removed':
        case 'remove':
          return `<span>убрал(-а) дочерний документ ${createDocLink(
            activity.old_entity_detail,
            activity.old_value ?? '',
          )} из документа ${createLinkByDocDetail()}`;
        case 'added':
          return `<span>добавил(-а) дочерний документ ${createDocLink(
            activity.new_entity_detail,
            activity.new_value ?? '',
          )} в ${createLinkByDocDetail()}</span>`;
        case 'created':
          return `<span>создал(-а) дочерний документ ${createDocLink(
            activity.new_entity_detail,
            activity.new_value ?? '',
          )} в ${createLinkByDocDetail()}</span>`;
      }
    case 'doc_sort':
      return `<span>отсортировал(-а) список дочерних документов в документе ${createLinkByDocDetail()}`;
    default:
      break;
  }
}
