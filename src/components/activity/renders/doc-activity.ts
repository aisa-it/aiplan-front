import { DtoEntityActivityFull } from '@aisa-it/aiplan-api-ts/src/data-contracts';

export function getURLDoc(activity: DtoEntityActivityFull) {
  return `<a target="_blank"
                    style="color: #3F76FF; text-decoration: none; font-weight: 400;"
                    href=${`/${activity.workspace_detail?.slug}/aidoc/${activity?.new_entity_detail?.id}`}>
                    "${activity.new_entity_detail?.title}"<a/>`;
}

export function docActivityRender(activity: DtoEntityActivityFull) {
  function createDocLink(
    activityId: string | undefined,
    activityTitle: string | undefined,
  ) {
    return `<a target="_blank"
                    style="color: #3F76FF; text-decoration: none; font-weight: 400;"
                    href=${`/${activity.workspace_detail?.slug}/aidoc/${activityId}`}>
                    "${activityTitle}"<a/>`;
  }

  function createLinkByDocDetail() {
    return createDocLink(activity.doc_detail?.id, activity.doc_detail?.title);
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
        case 'move':
          return `<span>перенес(-ла) документ "${activity.doc_detail
            ?.title}" из "${
            activity.old_value === activity.workspace_detail?.name
              ? 'корневого'
              : activity.old_value
          }" в "${
            activity.new_value === activity.workspace_detail?.name
              ? 'корневой'
              : activity.new_value
          }"<span/>`;
        case 'remove':
          return `<span>убрал(-а) дочерний документ ${createDocLink(
            activity.old_entity_detail?.id,
            activity.old_entity_detail?.title,
          )} из документа ${createLinkByDocDetail()}`;
        case 'added':
          return `<span>добавил(-а) дочерний документ ${createDocLink(
            activity.new_entity_detail?.id,
            activity.new_entity_detail?.title,
          )} в ${createLinkByDocDetail()}</span>`;
        case 'created':
          return `<span>создал(-а) дочерний документ ${createDocLink(
            activity.new_entity_detail?.id,
            activity.new_entity_detail?.title,
          )} в ${createLinkByDocDetail()}</span>`;
      }
    case 'doc_sort':
      return `<span>отсортировал(-а) список дочерних документов в документе ${createLinkByDocDetail()}`;
    default:
      break;
  }
}
