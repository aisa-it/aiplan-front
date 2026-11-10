import { i18n } from '@/i18n';
import dayjs from 'dayjs';

import { formatDateTime } from '@/utils/time';

import type {
  NotificationActivityData,
  NotificationMessagePart,
  WorkspaceNotification,
} from '../models';
import {
  addSpaceIfCamelCase,
  getEntity,
  getEntityByChange,
  getIssueHref,
  getPriorityText,
  getProjectHref,
  getSprintHref,
  getStringValue,
  getUserDisplayName,
  getVerbText,
  linkPart,
  textPart,
} from './notification-render.helpers';

const getIssueReference = (
  notification: WorkspaceNotification,
): NotificationMessagePart => {
  const { issue, project, workspace } = notification.detail;
  const issueKey =
    project?.identifier && issue?.sequence_id !== undefined
      ? `${project.identifier}-${issue.sequence_id}`
      : '';
  const text = `${issueKey}${issue?.name ? ` "${issue.name}"` : ''}`;

  return linkPart(
    text,
    getIssueHref(workspace?.slug, project?.identifier, issue?.sequence_id),
  );
};

export const renderIssueNotification = (
  notification: WorkspaceNotification,
): NotificationMessagePart[] => {
  const data = notification.data as NotificationActivityData;
  const issue = getIssueReference(notification);
  const newValue = getStringValue(data.new_value);
  const oldValue = getStringValue(data.old_value);
  const changedValue = newValue || oldValue;

  switch (data.field) {
    case 'issue':
      return [
        textPart(
          i18n.global.t('workspaceNotifications.renders.issue.theIssue2', {
            p0: getVerbText(data.verb),
            p1: oldValue
              ? `"${notification.detail.project?.identifier}-${oldValue}"`
              : '',
          }),
        ),
      ];
    case 'labels':
      return [
        textPart(
          i18n.global.t('workspaceNotifications.renders.issue.inTheIssue3', {
            p0: newValue
              ? i18n.global.t(
                  'workspaceNotifications.renders.issue.addedANewLabel',
                )
              : i18n.global.t(
                  'workspaceNotifications.renders.issue.removedALabel',
                ),
            p1: changedValue,
          }),
        ),
        issue,
      ];
    case 'status':
      return [
        textPart(
          i18n.global.t(
            'workspaceNotifications.renders.issue.changedTheStatusToInTheIssue',
            {
              p0: newValue
                ? addSpaceIfCamelCase(newValue)
                : i18n.global.t(
                    'workspaceNotifications.renders.issue.notSelected',
                  ),
            },
          ),
        ),
        issue,
      ];
    case 'priority': {
      const action = newValue
        ? oldValue && oldValue !== '<nil>'
          ? i18n.global.t(
              'workspaceNotifications.renders.issue.changedThePriorityTo',
            )
          : i18n.global.t('workspaceNotifications.renders.issue.setThePriority')
        : i18n.global.t(
            'workspaceNotifications.renders.issue.removedThePriority',
          );
      const priority = getPriorityText(data.new_value);
      const priorityText = priority
        ? ` "${priority.charAt(0).toUpperCase() + priority.slice(1).toLowerCase()}"`
        : '';
      return [
        textPart(
          i18n.global.t('workspaceNotifications.renders.issue.inTheIssue2', {
            p0: action,
            p1: priorityText,
          }),
        ),
        issue,
      ];
    }
    case 'blocking':
      return [
        textPart(
          newValue
            ? i18n.global.t(
                'workspaceNotifications.renders.issue.setTheConditionThatTheIssue',
              )
            : i18n.global.t(
                'workspaceNotifications.renders.issue.removedTheConditionThatTheIssue',
              ),
        ),
        issue,
        textPart(
          i18n.global.t('workspaceNotifications.renders.issue.blocks', {
            p0: changedValue,
          }),
        ),
      ];
    case 'blocks':
      return [
        textPart(
          i18n.global.t('workspaceNotifications.renders.issue.forTheIssue5', {
            p0: newValue
              ? i18n.global.t(
                  'workspaceNotifications.renders.issue.setTheBlocker',
                )
              : i18n.global.t(
                  'workspaceNotifications.renders.issue.removedTheBlocker',
                ),
            p1: changedValue,
          }),
        ),
        issue,
      ];
    case 'target_date': {
      const value = newValue || oldValue.replace(/"/g, '');
      const date = dayjs(value).isValid() ? formatDateTime(value) : value;
      return [
        textPart(
          i18n.global.t('workspaceNotifications.renders.issue.forTheIssue4', {
            p0: newValue
              ? i18n.global.t(
                  'workspaceNotifications.renders.issue.setTheDueDate',
                )
              : i18n.global.t(
                  'workspaceNotifications.renders.issue.removedTheDueDate',
                ),
            p1: date,
          }),
        ),
        issue,
      ];
    }
    case 'parent':
      return [
        textPart(
          i18n.global.t('workspaceNotifications.renders.issue.forTheIssue3', {
            p0: newValue
              ? i18n.global.t(
                  'workspaceNotifications.renders.issue.addedTheParentIssue',
                )
              : i18n.global.t(
                  'workspaceNotifications.renders.issue.removedTheParentIssue',
                ),
            p1: changedValue,
          }),
        ),
        issue,
      ];
    case 'sub_issue':
      return [
        textPart(
          i18n.global.t('workspaceNotifications.renders.issue.forTheIssue2', {
            p0: newValue
              ? i18n.global.t(
                  'workspaceNotifications.renders.issue.addedTheSubissue',
                )
              : i18n.global.t(
                  'workspaceNotifications.renders.issue.removedTheSubissue',
                ),
            p1: changedValue,
          }),
        ),
        issue,
      ];
    case 'linked':
      return [
        textPart(
          i18n.global.t('workspaceNotifications.renders.issue.forTheIssue', {
            p0: newValue
              ? i18n.global.t(
                  'workspaceNotifications.renders.issue.addedTheLinkedIssue',
                )
              : i18n.global.t(
                  'workspaceNotifications.renders.issue.removedTheLinkedIssue',
                ),
            p1: changedValue,
          }),
        ),
        issue,
      ];
    case 'watchers':
    case 'assignees': {
      const entity = getEntityByChange(data);
      const action = newValue
        ? i18n.global.t('workspaceNotifications.renders.issue.added')
        : i18n.global.t('workspaceNotifications.renders.issue.removed');
      const role =
        data.field === 'watchers'
          ? i18n.global.t('workspaceNotifications.renders.issue.watcher')
          : i18n.global.t('workspaceNotifications.renders.issue.assignee');
      return [
        textPart(
          `${action} ${role} ${getUserDisplayName(entity)} ${newValue ? i18n.global.t('workspaceNotifications.renders.issue.toTheIssue') : i18n.global.t('workspaceNotifications.renders.issue.fromTheIssue')} `,
        ),
        issue,
      ];
    }
    case 'description':
      return [
        textPart(
          i18n.global.t(
            'workspaceNotifications.renders.issue.updatedTheDescriptionInTheIssue',
          ),
        ),
        issue,
      ];
    case 'name':
      return [
        textPart(
          i18n.global.t(
            'workspaceNotifications.renders.issue.updatedTheTitleInTheIssue',
          ),
        ),
        issue,
      ];
    case 'attachment':
      return [
        textPart(
          i18n.global.t(
            'workspaceNotifications.renders.issue.anAttachmentToTheIssue',
            { p0: getVerbText(data.verb) },
          ),
        ),
        issue,
      ];
    case 'link':
    case 'link_url':
      return [
        textPart(
          i18n.global.t(
            'workspaceNotifications.renders.issue.aLinkInTheIssue',
            { p0: getVerbText(data.verb) },
          ),
        ),
        issue,
      ];
    case 'link_title':
      return [
        textPart(
          i18n.global.t(
            'workspaceNotifications.renders.issue.aLinkTitleInTheIssue',
            { p0: getVerbText(data.verb) },
          ),
        ),
        issue,
      ];
    case 'comment':
      return [
        textPart(
          i18n.global.t(
            'workspaceNotifications.renders.issue.aCommentInTheIssue',
            { p0: getVerbText(data.verb) },
          ),
        ),
        issue,
      ];
    case 'label':
      return [
        textPart(
          i18n.global.t(
            'workspaceNotifications.renders.issue.aLabelInTheIssue',
            { p0: getVerbText(data.verb) },
          ),
        ),
        issue,
      ];
    case 'project': {
      const newProject = getEntity(data.new_entity_detail);
      const oldProject = getEntity(data.old_entity_detail);
      const workspaceSlug = notification.detail.workspace?.slug;

      if (data.verb === 'move') {
        return [
          textPart(
            i18n.global.t('workspaceNotifications.renders.issue.movedTheIssue'),
          ),
          issue,
          textPart(' '),
          ...(oldValue
            ? [
                textPart(
                  i18n.global.t(
                    'workspaceNotifications.renders.issue.fromProject2',
                  ),
                ),
                linkPart(
                  oldProject.name ?? '',
                  getProjectHref(
                    workspaceSlug,
                    oldProject.identifier ?? oldProject.id,
                  ),
                ),
              ]
            : [
                textPart(
                  i18n.global.t(
                    'workspaceNotifications.renders.issue.fromAHiddenDeletedProject2',
                  ),
                ),
              ]),
          textPart(' '),
          ...(newValue
            ? [
                textPart(
                  i18n.global.t(
                    'workspaceNotifications.renders.issue.toProject2',
                  ),
                ),
                linkPart(
                  newProject.name ?? '',
                  getProjectHref(
                    workspaceSlug,
                    newProject.identifier ?? newProject.id,
                  ),
                ),
              ]
            : [
                textPart(
                  i18n.global.t(
                    'workspaceNotifications.renders.issue.toAHiddenDeletedProject2',
                  ),
                ),
              ]),
        ];
      }
      break;
    }
    case 'issue_transfer': {
      const action =
        data.verb === 'copied'
          ? i18n.global.t('workspaceNotifications.renders.issue.copied')
          : i18n.global.t('workspaceNotifications.renders.issue.moved');
      const oldProject = oldValue
        ? i18n.global.t('workspaceNotifications.renders.issue.fromProject', {
            p0: oldValue,
          })
        : i18n.global.t(
            'workspaceNotifications.renders.issue.fromAHiddenDeletedProject',
          );
      const newProject = newValue
        ? i18n.global.t('workspaceNotifications.renders.issue.toProject', {
            p0: newValue,
          })
        : i18n.global.t(
            'workspaceNotifications.renders.issue.toAHiddenDeletedProject',
          );
      return [
        textPart(
          i18n.global.t('workspaceNotifications.renders.issue.theIssue', {
            p0: action,
          }),
        ),
        issue,
        textPart(` ${oldProject} ${newProject}`),
      ];
    }
    case 'sprint': {
      const sprintEntity = getEntity(
        data.verb === 'removed'
          ? data.old_entity_detail
          : data.new_entity_detail,
      );
      const sprintName = sprintEntity.name || newValue || oldValue;
      const sprint = linkPart(
        sprintName || '',
        getSprintHref(
          notification.detail.workspace?.slug,
          sprintEntity.sequence_id ?? sprintEntity.id,
        ),
      );

      if (data.verb === 'added') {
        return [
          textPart(
            i18n.global.t('workspaceNotifications.renders.issue.addedTheIssue'),
          ),
          issue,
          textPart(
            i18n.global.t('workspaceNotifications.renders.issue.toTheSprint'),
          ),
          sprint,
        ];
      }
      if (data.verb === 'removed') {
        return [
          textPart(
            i18n.global.t(
              'workspaceNotifications.renders.issue.removedTheIssue',
            ),
          ),
          issue,
          textPart(
            i18n.global.t('workspaceNotifications.renders.issue.fromTheSprint'),
          ),
          sprint,
        ];
      }
      if (data.verb === 'updated') {
        return [
          textPart(
            i18n.global.t(
              'workspaceNotifications.renders.issue.changedTheSprintTo',
            ),
          ),
          sprint,
          textPart(
            i18n.global.t('workspaceNotifications.renders.issue.inTheIssue'),
          ),
          issue,
        ];
      }
      break;
    }
  }

  if (data.verb === 'created') {
    return [
      textPart(
        i18n.global.t('workspaceNotifications.renders.issue.createdTheIssue'),
      ),
      issue,
    ];
  }

  if (data.comment_stripped) {
    return [
      textPart(
        i18n.global.t(
          'workspaceNotifications.renders.issue.addedACommentToTheIssue',
        ),
      ),
      issue,
    ];
  }

  return [];
};
