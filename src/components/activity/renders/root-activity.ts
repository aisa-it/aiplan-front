import { DtoEntityActivityFull } from '@aisa-it/aiplan-api-ts/src/data-contracts';

export function rootActivityRender(activity: DtoEntityActivityFull) {
  const workspaceLink = `<a target="_blank"
                    style="color: #3F76FF; text-decoration: none; font-weight: 600;"
                    href=${activity?.entity_url}>
                     "${activity.new_value}"<a/>`;
  switch (activity.field) {
    case 'workspace':
      if (activity.verb === 'created') {
        return `<span>создал(-а) пространство ${workspaceLink} <span/>`;
      } else if (activity.verb === 'deleted') {
        return `<span>удалил(-а) пространство "${activity.old_value}" <span/>`;
      }
    default:
      break;
  }
}
