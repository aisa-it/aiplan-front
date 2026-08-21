import { createActivityRenderer } from '../../create-activity-renderer';
import {
  renderIssueAdded,
  renderIssueCopied,
  renderIssueCreated,
  renderIssueDeleted,
  renderIssueRemoved,
} from './issues';
import {
  renderLabelColor,
  renderLabelCreated,
  renderLabelDeleted,
  renderLabelName,
} from './labels';
import {
  renderDefaultAssignee,
  renderDefaultWatcher,
  renderProjectMemberAdded,
  renderProjectMemberRemoved,
  renderProjectMemberRole,
} from './members';
import {
  renderProjectIcon,
  renderProjectIdentifier,
  renderProjectLead,
  renderProjectName,
  renderProjectPrivacy,
  renderProjectRules,
} from './settings';
import {
  renderDefaultStatus,
  renderStatusColor,
  renderStatusCreated,
  renderStatusDefault,
  renderStatusDeleted,
  renderStatusDescription,
  renderStatusGroup,
  renderStatusName,
} from './statuses';
import {
  renderTemplateContent,
  renderTemplateCreated,
  renderTemplateDeleted,
  renderTemplateName,
} from './templates';

export const renderProjectActivity = createActivityRenderer({
  emoji: renderProjectIcon,
  logo: renderProjectIcon,
  name: renderProjectName,
  identifier: renderProjectIdentifier,
  public: renderProjectPrivacy,
  project_lead: renderProjectLead,
  default_assignees: renderDefaultAssignee,
  default_watchers: renderDefaultWatcher,
  member: {
    added: renderProjectMemberAdded,
    removed: renderProjectMemberRemoved,
  },
  role: {
    updated: renderProjectMemberRole,
  },
  status: {
    created: renderStatusCreated,
    deleted: renderStatusDeleted,
  },
  default: {
    updated: renderDefaultStatus,
  },
  status_name: {
    updated: renderStatusName,
  },
  status_description: {
    updated: renderStatusDescription,
  },
  status_group: {
    updated: renderStatusGroup,
  },
  status_color: {
    updated: renderStatusColor,
  },
  status_default: {
    updated: renderStatusDefault,
  },
  label: {
    created: renderLabelCreated,
    deleted: renderLabelDeleted,
  },
  label_name: {
    updated: renderLabelName,
  },
  label_color: {
    updated: renderLabelColor,
  },
  issue: {
    added: renderIssueAdded,
    created: renderIssueCreated,
    deleted: renderIssueDeleted,
    copied: renderIssueCopied,
    removed: renderIssueRemoved,
  },
  template: {
    created: renderTemplateCreated,
    deleted: renderTemplateDeleted,
  },
  template_name: {
    updated: renderTemplateName,
  },
  template_template: {
    updated: renderTemplateContent,
  },
  rules_script: {
    updated: renderProjectRules,
  },
});
