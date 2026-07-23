import { HistoryEntry, HistoryRenderer, ProjectBase } from './types';

import { renderBlocks } from './renders/blocks';
import { renderAssignees, renderWatchers } from './renders/assignees';
import {
  renderCompletedAt,
  renderStartDate,
  renderTargetDate,
} from './renders/dates';
import {
  renderLinked,
  renderLink,
  renderLinkUrl,
  renderLinkTitle,
} from './renders/links';
import { renderAttachment } from './renders/attachments';
import { renderParent, renderBlocking, renderSubIssue } from './renders/issues';
import { renderComment } from './renders/comments';
import { renderLabels, renderLabel } from './renders/labels';
import { renderSprint } from './renders/sprints';
import {
  renderDoc,
  renderDocSort,
  renderSeqId,
  renderDescription,
  renderTitle
} from './renders/docs';
import { renderIssueTransfer, renderProject } from './renders/projects';
import { renderPriority, renderDefault } from './renders/priority';
import { renderReader, renderReaderRole } from 'src/components/activity/entityActivity/renders/readers';
import { renderEditor, renderEditorRole } from 'src/components/activity/entityActivity/renders/editors';

const fieldRenderers: Record<string, HistoryRenderer> = {
  blocks: renderBlocks,
  assignees: renderAssignees,
  watchers: renderWatchers,
  completed_at: renderCompletedAt,
  start_date: renderStartDate,
  target_date: renderTargetDate,
  linked: renderLinked,
  link: renderLink,
  link_url: renderLinkUrl,
  link_title: renderLinkTitle,
  attachment: renderAttachment,
  parent: renderParent,
  blocking: renderBlocking,
  sub_issue: renderSubIssue,
  comment: renderComment,
  labels: renderLabels,
  label: renderLabel,
  sprint: renderSprint,
  doc: renderDoc,
  doc_sort: renderDocSort,
  seq_id: renderSeqId,
  description: renderDescription,
  issue_transfer: renderIssueTransfer,
  project: renderProject,
  priority: renderPriority,
  readers: renderReader,
  editors: renderEditor,
  reader_role: renderReaderRole,
  editor_role: renderEditorRole,
  title: renderTitle,
};

export function entityActivityRenderer(
  m: HistoryEntry,
  wsProjects: ProjectBase[],
): string {
  const renderer = fieldRenderers[m.field];

  if (renderer) {
    const result = renderer(m, wsProjects);
    if (result) return result;
  }

  return renderDefault(m);
}

export { getIcon } from './utils/getIcon';

export type { HistoryEntry, HistoryRenderer } from './types';

