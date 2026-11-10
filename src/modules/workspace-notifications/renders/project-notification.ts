import { i18n } from '@/i18n';
import type {
  NotificationActivityData,
  NotificationMessagePart,
  WorkspaceNotification,
} from '../models';
import {
  capitalizeFirstLetter,
  getEntity,
  getFullName,
  getIssueHref,
  getNetworkText,
  getPriorityText,
  getProjectHref,
  getRoleText,
  getStateText,
  getStringValue,
  getVerbText,
  linkPart,
  textPart,
} from './notification-render.helpers';

const getProjectReference = (
  notification: WorkspaceNotification,
): NotificationMessagePart => {
  const { project, workspace } = notification.detail;

  return linkPart(
    project?.name ?? '',
    getProjectHref(workspace?.slug ?? project?.workspace, project?.identifier),
  );
};

const getChangedIssueReference = (
  notification: WorkspaceNotification,
  data: NotificationActivityData,
  useOldEntity = false,
): NotificationMessagePart => {
  const entity = getEntity(
    useOldEntity ? data.old_entity_detail : data.new_entity_detail,
  );
  const value = getStringValue(useOldEntity ? data.old_value : data.new_value);
  const project = notification.detail.project;
  const issueText = `${value}${entity.name ? ` "${entity.name}"` : ''}`;

  return linkPart(
    issueText,
    getIssueHref(
      notification.detail.workspace?.slug,
      project?.identifier,
      entity.sequence_id,
    ),
  );
};

export const renderProjectNotification = (
  notification: WorkspaceNotification,
): NotificationMessagePart[] => {
  const data = notification.data as NotificationActivityData;
  const project = getProjectReference(notification);
  const hasProject = Boolean(notification.detail.project?.name);
  const newValue = getStringValue(data.new_value);
  const oldValue = getStringValue(data.old_value);

  switch (data.field) {
    case 'emoji':
      return [
        textPart(
          i18n.global.t(
            'workspaceNotifications.renders.project.changedTheProjectEmoji',
          ),
        ),
        project,
      ];
    case 'logo':
      return [
        textPart(
          i18n.global.t(
            'workspaceNotifications.renders.project.changedTheProjectLogo',
          ),
        ),
        project,
      ];
    case 'name':
      return [
        textPart(
          i18n.global.t(
            'workspaceNotifications.renders.project.changedTheProjectNameFromTo',
            { p0: oldValue },
          ),
        ),
        hasProject ? project : textPart(`"${newValue}"`),
      ];
    case 'description':
      return [
        textPart(
          i18n.global.t(
            'workspaceNotifications.renders.project.changedTheProjectDescription',
          ),
        ),
        project,
        textPart(
          i18n.global.t('workspaceNotifications.renders.project.fromTo5', {
            p0:
              oldValue ||
              i18n.global.t(
                'workspaceNotifications.renders.project.noDescription3',
              ),
            p1:
              newValue ||
              i18n.global.t(
                'workspaceNotifications.renders.project.noDescription4',
              ),
          }),
        ),
      ];
    case 'identifier':
      return [
        textPart(
          i18n.global.t(
            'workspaceNotifications.renders.project.changedTheProjectIdentifier',
          ),
        ),
        project,
        textPart(
          i18n.global.t('workspaceNotifications.renders.project.fromTo4', {
            p0: oldValue,
            p1: newValue,
          }),
        ),
      ];
    case 'network':
    case 'public':
      return [
        textPart(
          i18n.global.t(
            'workspaceNotifications.renders.project.changedTheProjectVisibility',
          ),
        ),
        project,
        textPart(
          i18n.global.t('workspaceNotifications.renders.project.fromTo3', {
            p0: getNetworkText(data.old_value),
            p1: getNetworkText(data.new_value),
          }),
        ),
      ];
    case 'project_lead':
      return [
        textPart(
          i18n.global.t(
            'workspaceNotifications.renders.project.changedTheProjectLead',
          ),
        ),
        project,
        textPart(
          i18n.global.t('workspaceNotifications.renders.project.fromTo2', {
            p0: getFullName(data.old_entity_detail),
            p1: getFullName(data.new_entity_detail),
          }),
        ),
      ];
    case 'default_assignees':
    case 'default_watchers': {
      const isAdded = Boolean(data.new_value);
      const role =
        data.field === 'default_assignees'
          ? i18n.global.t(
              'workspaceNotifications.renders.project.defaultAssignee',
            )
          : i18n.global.t(
              'workspaceNotifications.renders.project.defaultWatcher',
            );
      const user = isAdded ? data.new_entity_detail : data.old_entity_detail;
      return [
        textPart(
          `${isAdded ? i18n.global.t('workspaceNotifications.renders.project.added') : i18n.global.t('workspaceNotifications.renders.project.removed')} `,
        ),
        ...(hasProject
          ? [
              textPart(
                i18n.global.t(
                  'workspaceNotifications.renders.project.project',
                  {
                    p0: isAdded
                      ? i18n.global.t(
                          'workspaceNotifications.renders.project.to',
                        )
                      : i18n.global.t(
                          'workspaceNotifications.renders.project.from',
                        ),
                  },
                ),
              ),
              project,
              textPart(' '),
            ]
          : []),
        textPart(`${role} ${getFullName(user)}`),
      ];
    }
    case 'member': {
      const action = getVerbText(data.verb);
      if (data.verb === 'added') {
        return [
          textPart(`${action} `),
          ...(hasProject
            ? [
                textPart(
                  i18n.global.t(
                    'workspaceNotifications.renders.project.toProject5',
                  ),
                ),
                project,
              ]
            : []),
          textPart(
            i18n.global.t(
              'workspaceNotifications.renders.project.userWithRole',
              {
                p0: getFullName(data.new_entity_detail),
                p1: getRoleText(data.new_value),
              },
            ),
          ),
        ];
      }
      if (data.verb === 'removed' || data.verb === 'deleted') {
        return [
          textPart(
            i18n.global.t('workspaceNotifications.renders.project.user', {
              p0: action,
              p1: getFullName(data.old_entity_detail),
            }),
          ),
          ...(hasProject
            ? [
                textPart(
                  i18n.global.t(
                    'workspaceNotifications.renders.project.fromProject2',
                  ),
                ),
                project,
              ]
            : []),
        ];
      }
      break;
    }
    case 'role':
      return [
        textPart(
          i18n.global.t(
            'workspaceNotifications.renders.project.theRoleOfUser',
            {
              p0: getVerbText(data.verb),
              p1: getFullName(data.new_entity_detail),
            },
          ),
        ),
        ...(hasProject
          ? [
              textPart(
                i18n.global.t(
                  'workspaceNotifications.renders.project.ofProject',
                ),
              ),
              project,
            ]
          : []),
        textPart(
          i18n.global.t('workspaceNotifications.renders.project.fromTo', {
            p0: getRoleText(data.old_value),
            p1: getRoleText(data.new_value),
          }),
        ),
      ];
    case 'status':
      if (data.verb === 'created') {
        return [
          textPart(
            i18n.global.t('workspaceNotifications.renders.project.theStatus2', {
              p0: getVerbText(data.verb),
              p1: newValue,
            }),
          ),
          ...(hasProject
            ? [
                textPart(
                  i18n.global.t(
                    'workspaceNotifications.renders.project.toProject4',
                  ),
                ),
                project,
              ]
            : []),
        ];
      }
      if (data.verb === 'deleted') {
        return [
          textPart(
            i18n.global.t('workspaceNotifications.renders.project.theStatus', {
              p0: getVerbText(data.verb),
              p1: oldValue,
            }),
          ),
          ...(hasProject
            ? [
                textPart(
                  i18n.global.t(
                    'workspaceNotifications.renders.project.inProject12',
                  ),
                ),
                project,
              ]
            : []),
        ];
      }
      break;
    case 'default':
      if (data.verb === 'updated') {
        return [
          textPart(
            i18n.global.t(
              'workspaceNotifications.renders.project.changedTheDefaultStatusFromTo2',
              { p0: oldValue, p1: newValue },
            ),
          ),
          ...(hasProject
            ? [
                textPart(
                  i18n.global.t(
                    'workspaceNotifications.renders.project.inProject11',
                  ),
                ),
                project,
              ]
            : []),
        ];
      }
      break;
    case 'status_default':
      return [
        textPart(
          i18n.global.t(
            'workspaceNotifications.renders.project.changedTheDefaultStatusFromTo',
            { p0: oldValue, p1: newValue },
          ),
        ),
        ...(hasProject
          ? [
              textPart(
                i18n.global.t(
                  'workspaceNotifications.renders.project.inProject10',
                ),
              ),
              project,
            ]
          : []),
      ];
    case 'status_name':
      return [
        textPart(
          i18n.global.t(
            'workspaceNotifications.renders.project.changedTheStatusNameFromTo',
            { p0: oldValue, p1: newValue },
          ),
        ),
        ...(hasProject
          ? [
              textPart(
                i18n.global.t(
                  'workspaceNotifications.renders.project.inProject9',
                ),
              ),
              project,
            ]
          : []),
      ];
    case 'status_description':
      return [
        textPart(
          i18n.global.t(
            'workspaceNotifications.renders.project.changedTheDescriptionOfStatusFromTo',
            {
              p0:
                getEntity(data.new_entity_detail).name ||
                data.new_identifier ||
                '',
              p1:
                oldValue ||
                i18n.global.t(
                  'workspaceNotifications.renders.project.noDescription',
                ),
              p2:
                newValue ||
                i18n.global.t(
                  'workspaceNotifications.renders.project.noDescription2',
                ),
            },
          ),
        ),
        ...(hasProject
          ? [
              textPart(
                i18n.global.t(
                  'workspaceNotifications.renders.project.inProject8',
                ),
              ),
              project,
            ]
          : []),
      ];
    case 'status_group':
      return [
        textPart(
          i18n.global.t(
            'workspaceNotifications.renders.project.changedTheStatusGroupOfFromTo',
            {
              p0:
                getEntity(data.new_entity_detail).name ||
                data.new_identifier ||
                '',
              p1: getStateText(data.old_value),
              p2: getStateText(data.new_value),
            },
          ),
        ),
        ...(hasProject
          ? [
              textPart(
                i18n.global.t(
                  'workspaceNotifications.renders.project.inProject7',
                ),
              ),
              project,
            ]
          : []),
      ];
    case 'status_color':
      return [
        textPart(
          i18n.global.t(
            'workspaceNotifications.renders.project.changedTheStatusColorFromTo',
            { p0: oldValue.toUpperCase(), p1: newValue.toUpperCase() },
          ),
        ),
        ...(hasProject
          ? [
              textPart(
                i18n.global.t(
                  'workspaceNotifications.renders.project.inProject6',
                ),
              ),
              project,
            ]
          : []),
      ];
    case 'label':
      if (data.verb === 'created' || data.verb === 'deleted') {
        const value = data.verb === 'created' ? newValue : oldValue;
        return [
          textPart(
            i18n.global.t('workspaceNotifications.renders.project.theLabel', {
              p0: getVerbText(data.verb),
              p1: value,
            }),
          ),
          ...(hasProject
            ? [
                textPart(
                  data.verb === 'created'
                    ? i18n.global.t(
                        'workspaceNotifications.renders.project.toProject3',
                      )
                    : i18n.global.t(
                        'workspaceNotifications.renders.project.inProject5',
                      ),
                ),
                project,
              ]
            : []),
        ];
      }
      break;
    case 'label_name':
      return [
        textPart(
          i18n.global.t(
            'workspaceNotifications.renders.project.changedTheLabelNameFromTo',
            { p0: oldValue, p1: newValue },
          ),
        ),
        ...(hasProject
          ? [
              textPart(
                i18n.global.t(
                  'workspaceNotifications.renders.project.inProject4',
                ),
              ),
              project,
            ]
          : []),
      ];
    case 'label_color':
      return [
        textPart(
          i18n.global.t(
            'workspaceNotifications.renders.project.changedTheLabelColorFromTo',
            { p0: oldValue.toUpperCase(), p1: newValue.toUpperCase() },
          ),
        ),
        ...(hasProject
          ? [
              textPart(
                i18n.global.t(
                  'workspaceNotifications.renders.project.inProject3',
                ),
              ),
              project,
            ]
          : []),
      ];
    case 'issue':
      if (data.verb === 'created') {
        const entity = getEntity(data.new_entity_detail);
        const priority = entity.priority
          ? i18n.global.t(
              'workspaceNotifications.renders.project.withPriority',
              { p0: capitalizeFirstLetter(getPriorityText(entity.priority)) },
            )
          : i18n.global.t(
              'workspaceNotifications.renders.project.withoutPriority',
            );
        return [
          textPart(
            i18n.global.t(
              'workspaceNotifications.renders.project.createdTheIssue',
            ),
          ),
          getChangedIssueReference(notification, data),
          textPart(` ${priority} `),
          ...(hasProject
            ? [
                textPart(
                  i18n.global.t(
                    'workspaceNotifications.renders.project.inProject2',
                  ),
                ),
                project,
              ]
            : []),
        ];
      }
      if (data.verb === 'deleted') {
        return [
          textPart(
            i18n.global.t(
              'workspaceNotifications.renders.project.deletedTheIssue',
              { p0: oldValue },
            ),
          ),
          ...(hasProject
            ? [
                textPart(
                  i18n.global.t(
                    'workspaceNotifications.renders.project.inProject',
                  ),
                ),
                project,
              ]
            : []),
        ];
      }
      if (data.verb === 'copied') {
        return [
          textPart(
            i18n.global.t(
              'workspaceNotifications.renders.project.copiedTheIssue',
            ),
          ),
          getChangedIssueReference(notification, data),
          textPart(
            i18n.global.t('workspaceNotifications.renders.project.toProject2'),
          ),
          project,
        ];
      }
      if (data.verb === 'removed') {
        return [
          textPart(
            i18n.global.t(
              'workspaceNotifications.renders.project.removedTheIssue',
            ),
          ),
          getChangedIssueReference(notification, data, true),
          textPart(
            i18n.global.t('workspaceNotifications.renders.project.fromProject'),
          ),
          project,
        ];
      }
      if (data.verb === 'added') {
        return [
          textPart(
            i18n.global.t(
              'workspaceNotifications.renders.project.addedTheIssue',
            ),
          ),
          getChangedIssueReference(notification, data),
          textPart(
            i18n.global.t('workspaceNotifications.renders.project.toProject'),
          ),
          project,
        ];
      }
      break;
    case 'template':
      if (data.verb === 'created' || data.verb === 'deleted') {
        const value = data.verb === 'created' ? newValue : oldValue;
        return [
          textPart(
            i18n.global.t(
              'workspaceNotifications.renders.project.theIssueTemplateInProject',
              {
                p0:
                  data.verb === 'created'
                    ? i18n.global.t(
                        'workspaceNotifications.renders.project.created',
                      )
                    : i18n.global.t(
                        'workspaceNotifications.renders.project.deleted',
                      ),
                p1: value,
              },
            ),
          ),
          project,
        ];
      }
      break;
    case 'template_name':
      if (data.verb === 'updated') {
        return [
          textPart(
            i18n.global.t(
              'workspaceNotifications.renders.project.changedTheIssueTemplateTitleFromToInProject',
              { p0: oldValue, p1: newValue },
            ),
          ),
          project,
        ];
      }
      break;
    case 'template_template':
      if (data.verb === 'updated') {
        return [
          textPart(
            i18n.global.t(
              'workspaceNotifications.renders.project.changedTheIssueTemplateInProject',
              { p0: getEntity(data.new_entity_detail).name ?? '' },
            ),
          ),
          project,
        ];
      }
      break;
  }

  if (data.verb === 'created') {
    return [
      textPart(
        i18n.global.t('workspaceNotifications.renders.project.addedTheProject'),
      ),
      project,
    ];
  }
  if (data.verb === 'deleted') {
    return [
      textPart(
        i18n.global.t(
          'workspaceNotifications.renders.project.deletedTheProject',
          { p0: oldValue },
        ),
      ),
    ];
  }

  return [];
};
