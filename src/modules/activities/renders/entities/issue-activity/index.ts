import { createActivityRenderer } from '../../create-activity-renderer';
import { renderIssueAttachment } from './attachment';
import { renderIssueComment } from './comment';
import {
  renderIssueCompletedAt,
  renderIssueStartDate,
  renderIssueTargetDate,
} from './date';
import {
  renderIssueCreated,
  renderIssueField,
  renderIssueMoved,
} from './issue';
import { renderIssueLabel } from './label';
import {
  renderIssueLink,
  renderIssueLinkTitle,
  renderIssueLinkUrl,
} from './link';
import {
  renderIssueAssigneeAdded,
  renderIssueAssigneeRemoved,
  renderIssueWatcherAdded,
  renderIssueWatcherRemoved,
} from './member';
import {
  renderIssueDescription,
  renderIssueName,
  renderIssuePriority,
  renderIssueStatus,
} from './property';
import {
  renderIssueBlocking,
  renderIssueBlocks,
  renderIssueLinked,
  renderIssueParent,
  renderIssueSubIssue,
} from './relation';
import {
  renderIssueSprintAdded,
  renderIssueSprintRemoved,
} from './sprint';

export const renderIssueActivity = createActivityRenderer({
  '': {
    created: renderIssueCreated,
    move: renderIssueMoved,
  },
  issue: renderIssueField,
  name: renderIssueName,
  description: renderIssueDescription,
  status: renderIssueStatus,
  priority: renderIssuePriority,
  assignees: {
    added: renderIssueAssigneeAdded,
    removed: renderIssueAssigneeRemoved,
  },
  watchers: {
    added: renderIssueWatcherAdded,
    removed: renderIssueWatcherRemoved,
  },
  parent: renderIssueParent,
  sub_issue: renderIssueSubIssue,
  linked: renderIssueLinked,
  blocking: renderIssueBlocking,
  blocks: renderIssueBlocks,
  sprint: {
    added: renderIssueSprintAdded,
    removed: renderIssueSprintRemoved,
  },
  target_date: {
    updated: renderIssueTargetDate,
  },
  start_date: renderIssueStartDate,
  completed_at: renderIssueCompletedAt,
  label: renderIssueLabel,
  link: renderIssueLink,
  link_url: renderIssueLinkUrl,
  link_title: renderIssueLinkTitle,
  comment: renderIssueComment,
  attachment: renderIssueAttachment,
});
