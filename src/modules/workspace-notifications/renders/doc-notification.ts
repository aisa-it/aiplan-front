import { i18n } from '@/i18n';
import type {
  NotificationActivityData,
  NotificationMessagePart,
  WorkspaceNotification,
} from '../models';
import {
  getEntity,
  getFullName,
  getStringValue,
  linkPart,
  textPart,
} from './notification-render.helpers';

const getDocReference = (
  notification: WorkspaceNotification,
): NotificationMessagePart => {
  const doc = notification.detail.doc;
  return linkPart(`"${doc?.title ?? ''}"`, doc?.url);
};

export const renderDocNotification = (
  notification: WorkspaceNotification,
): NotificationMessagePart[] => {
  const data = notification.data as NotificationActivityData;
  const doc = getDocReference(notification);

  switch (data.field) {
    case 'title':
      if (data.verb === 'updated') {
        return [
          textPart(
            i18n.global.t(
              'workspaceNotifications.renders.doc.updatedTheTitleInTheDocument',
            ),
          ),
          doc,
        ];
      }
      break;
    case 'description':
      if (data.verb === 'updated') {
        return [
          textPart(
            i18n.global.t(
              'workspaceNotifications.renders.doc.updatedTheDescriptionInTheDocument',
            ),
          ),
          doc,
        ];
      }
      break;
    case 'attachment':
      if (data.verb === 'created') {
        return [
          textPart(
            i18n.global.t(
              'workspaceNotifications.renders.doc.addedAnAttachmentToTheDocument',
            ),
          ),
          doc,
        ];
      }
      if (data.verb === 'deleted') {
        return [
          textPart(
            i18n.global.t(
              'workspaceNotifications.renders.doc.deletedAnAttachmentFromTheDocument',
            ),
          ),
          doc,
        ];
      }
      break;
    case 'comment':
      if (data.verb === 'created') {
        return [
          textPart(
            i18n.global.t(
              'workspaceNotifications.renders.doc.addedACommentToTheDocument',
            ),
          ),
          doc,
        ];
      }
      if (data.verb === 'deleted') {
        return [
          textPart(
            i18n.global.t(
              'workspaceNotifications.renders.doc.deletedACommentInTheDocument',
            ),
          ),
          doc,
        ];
      }
      if (data.verb === 'updated') {
        return [
          textPart(
            i18n.global.t(
              'workspaceNotifications.renders.doc.editedACommentInTheDocument',
            ),
          ),
          doc,
        ];
      }
      break;
    case 'watchers':
      if (data.verb === 'added') {
        return [
          textPart(
            i18n.global.t(
              'workspaceNotifications.renders.doc.addedWatcherToTheDocument',
              { p0: getFullName(data.new_entity_detail) },
            ),
          ),
          doc,
        ];
      }
      if (data.verb === 'removed') {
        return [
          textPart(
            i18n.global.t(
              'workspaceNotifications.renders.doc.removedWatcherFromTheDocument',
              { p0: getFullName(data.old_entity_detail) },
            ),
          ),
          doc,
        ];
      }
      break;
    case 'reader_role':
    case 'editor_role':
      if (data.verb === 'updated') {
        return [
          textPart(
            i18n.global.t(
              'workspaceNotifications.renders.doc.updatedAccessPermissionsInTheDocument',
            ),
          ),
          doc,
        ];
      }
      break;
    case 'readers':
    case 'editors':
      if (data.verb === 'added' || data.verb === 'removed') {
        const user =
          data.verb === 'added'
            ? data.new_entity_detail
            : data.old_entity_detail;
        return [
          textPart(
            i18n.global.t(
              'workspaceNotifications.renders.doc.updatedIndividualAccessPermissionsForInTheDocument',
              { p0: getFullName(user) },
            ),
          ),
          doc,
        ];
      }
      break;
    case 'doc': {
      const newValue = getStringValue(data.new_value);
      const oldValue = getStringValue(data.old_value);

      if (data.verb === 'created') {
        const entity = getEntity(data.new_entity_detail);
        return [
          textPart(
            i18n.global.t(
              'workspaceNotifications.renders.doc.createdTheDocument',
            ),
          ),
          linkPart(`"${newValue}"`, entity.url),
        ];
      }
      if (data.verb === 'deleted') {
        return [
          textPart(
            i18n.global.t(
              'workspaceNotifications.renders.doc.deletedTheDocument',
              { p0: oldValue },
            ),
          ),
        ];
      }
      if (
        data.verb === 'move_doc_to_doc' ||
        data.verb === 'move_doc_to_workspace' ||
        data.verb === 'move_workspace_to_doc'
      ) {
        return [
          textPart(
            i18n.global.t(
              'workspaceNotifications.renders.doc.movedTheDocument',
            ),
          ),
          doc,
          textPart(
            i18n.global.t('workspaceNotifications.renders.doc.fromTo', {
              p0: data.old_entity_detail
                ? oldValue
                : i18n.global.t(
                    'workspaceNotifications.renders.doc.theRootFolder',
                  ),
              p1: data.new_entity_detail
                ? newValue
                : i18n.global.t(
                    'workspaceNotifications.renders.doc.theRootFolder2',
                  ),
            }),
          ),
        ];
      }
      if (data.verb === 'added') {
        return [
          textPart(
            i18n.global.t(
              'workspaceNotifications.renders.doc.addedTheChildDocument',
            ),
          ),
          linkPart(`"${newValue}"`, getEntity(data.new_entity_detail).url),
        ];
      }
      if (data.verb === 'removed') {
        return [
          textPart(
            i18n.global.t(
              'workspaceNotifications.renders.doc.removedTheChildDocument',
            ),
          ),
          linkPart(`"${oldValue}"`, getEntity(data.old_entity_detail).url),
        ];
      }
      break;
    }
  }

  return [];
};
