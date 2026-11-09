import { i18n } from '@/i18n';
import type {
  NotificationActivityData,
  NotificationMessagePart,
  WorkspaceNotification,
} from '../models';
import {
  getEntity,
  getFullName,
  getProjectHref,
  getRoleText,
  getStringValue,
  getVerbText,
  linkPart,
  textPart,
} from './notification-render.helpers';

export const renderWorkspaceNotification = (
  notification: WorkspaceNotification,
): NotificationMessagePart[] => {
  const data = notification.data as NotificationActivityData;
  const action = getVerbText(data.verb);
  const newValue = getStringValue(data.new_value);
  const oldValue = getStringValue(data.old_value);

  switch (data.field) {
    case 'logo':
      return [
        textPart(
          i18n.global.t('workspaceNotifications.renders.workspace.theIcon', {
            p0: action,
          }),
        ),
      ];
    case 'name':
      return [
        textPart(
          i18n.global.t(
            'workspaceNotifications.renders.workspace.theWorkspaceName',
            { p0: action },
          ),
        ),
      ];
    case 'owner':
      return [
        textPart(
          i18n.global.t(
            'workspaceNotifications.renders.workspace.theWorkspaceLeadFromTo',
            {
              p0: action,
              p1: getFullName(data.old_entity_detail),
              p2: getFullName(data.new_entity_detail),
            },
          ),
        ),
      ];
    case 'description':
      return [
        textPart(
          i18n.global.t(
            'workspaceNotifications.renders.workspace.theWorkspaceDescription',
            { p0: action },
          ),
        ),
      ];
    case 'integration_token':
      return [
        textPart(
          i18n.global.t('workspaceNotifications.renders.workspace.theToken', {
            p0: action,
          }),
        ),
      ];
    case 'member':
      if (data.verb === 'added') {
        return [
          textPart(
            i18n.global.t(
              'workspaceNotifications.renders.workspace.newUserWithRole',
              {
                p0: action,
                p1: getFullName(data.new_entity_detail),
                p2: getRoleText(data.new_value),
              },
            ),
          ),
        ];
      }
      if (data.verb === 'removed') {
        return [
          textPart(
            i18n.global.t('workspaceNotifications.renders.workspace.user', {
              p0: action,
              p1: getFullName(data.old_entity_detail),
            }),
          ),
        ];
      }
      break;
    case 'role':
      return [
        textPart(
          i18n.global.t(
            'workspaceNotifications.renders.workspace.changedTheRoleOfUserFromTo',
            {
              p0: getFullName(data.new_entity_detail),
              p1: getRoleText(data.old_value),
              p2: getRoleText(data.new_value),
            },
          ),
        ),
      ];
    case 'integration':
      return [
        textPart(
          i18n.global.t(
            'workspaceNotifications.renders.workspace.theIntegration',
            { p0: action, p1: newValue || oldValue },
          ),
        ),
      ];
    case 'project':
      if (data.verb === 'created') {
        const project = getEntity(data.new_entity_detail);
        const href = getProjectHref(
          notification.detail.workspace?.slug,
          project.identifier,
        );
        const projectText = project.name
          ? `${newValue} "${project.name}"`
          : newValue;
        return [
          textPart(
            i18n.global.t(
              'workspaceNotifications.renders.workspace.createdTheProject',
            ),
          ),
          linkPart(projectText, href),
        ];
      }
      if (data.verb === 'deleted') {
        return [
          textPart(
            i18n.global.t(
              'workspaceNotifications.renders.workspace.deletedTheProject',
              { p0: oldValue },
            ),
          ),
        ];
      }
      break;
    case 'doc': {
      const entity = getEntity(
        data.verb === 'removed'
          ? data.old_entity_detail
          : data.new_entity_detail,
      );
      const value = data.verb === 'removed' ? oldValue : newValue;
      const doc = linkPart(`"${value}"`, entity.url);

      if (data.verb === 'created')
        return [
          textPart(
            i18n.global.t(
              'workspaceNotifications.renders.workspace.createdTheDocument',
            ),
          ),
          doc,
        ];
      if (data.verb === 'deleted') {
        return [
          textPart(
            i18n.global.t(
              'workspaceNotifications.renders.workspace.deletedTheDocument',
              { p0: oldValue },
            ),
          ),
        ];
      }
      if (data.verb === 'added') {
        return [
          textPart(
            i18n.global.t(
              'workspaceNotifications.renders.workspace.addedTheChildDocument',
            ),
          ),
          doc,
        ];
      }
      if (data.verb === 'removed') {
        return [
          textPart(
            i18n.global.t(
              'workspaceNotifications.renders.workspace.removedTheChildDocument',
            ),
          ),
          doc,
        ];
      }
      break;
    }
    case 'sprint':
      if (data.verb === 'created') {
        const sprint = getEntity(data.new_entity_detail);
        return [
          textPart(
            i18n.global.t(
              'workspaceNotifications.renders.workspace.createdTheSprint',
            ),
          ),
          linkPart(newValue, sprint.url),
        ];
      }
      if (data.verb === 'deleted') {
        return [
          textPart(
            i18n.global.t(
              'workspaceNotifications.renders.workspace.deletedTheSprint',
              { p0: oldValue },
            ),
          ),
        ];
      }
      break;
  }

  return [];
};
