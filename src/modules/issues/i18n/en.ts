import type ru from './ru';

export default {
  columns: {
    sequence_id: 'ID', name: 'Name', priority: 'Priority', state: 'Status',
    target_date: 'Due date', created_at: 'Created', updated_at: 'Last updated',
    author: 'Author', assignees: 'Assignee', watchers: 'Watchers', labels: 'Tags',
    sub_issues_count: 'Subtasks', linked_issues_count: 'Relations',
    link_count: 'Links', attachment_count: 'Attachments', sprint: 'Sprint',
  },
  filters: {
    display: 'Display',
    reset: 'Reset',
    resetQuestion: 'Task list display settings will be reset to their defaults. Continue?',
    cancel: 'Cancel',
    execute: 'Confirm',
    view: 'View',
    list: 'List',
    columns: 'Columns',
    grouping: 'Grouping',
    noGrouping: 'None',
    statusFilter: 'Filter by status',
    hideSubIssues: 'Hide subtasks',
    showDrafts: 'Show drafts',
    onlyActive: 'Active only',
    assignedToMe: 'I am an assignee',
    watchedToMe: 'I am a watcher',
    authoredToMe: 'I am the author',
  },
  property: { yes: 'Yes' },
} satisfies typeof ru;
