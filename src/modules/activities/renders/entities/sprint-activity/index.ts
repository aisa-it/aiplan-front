import { createActivityRenderer } from '../../create-activity-renderer';
import { renderSprintEndDate, renderSprintStartDate } from './date';
import {
  renderSprintIssueAdded,
  renderSprintIssueRemoved,
} from './issue';
import {
  renderSprintDescription,
  renderSprintName,
} from './property';
import { renderSprintFolder } from './sprint-folder';
import {
  renderSprintWatcherAdded,
  renderSprintWatcherRemoved,
} from './watcher';

const sprintIssueRenderers = {
  added: renderSprintIssueAdded,
  removed: renderSprintIssueRemoved,
} as const;

export const renderSprintActivity = createActivityRenderer({
  name: renderSprintName,
  description: renderSprintDescription,
  issue: sprintIssueRenderers,
  issues: sprintIssueRenderers,
  watchers: {
    added: renderSprintWatcherAdded,
    removed: renderSprintWatcherRemoved,
  },
  start_date: renderSprintStartDate,
  end_date: renderSprintEndDate,
  sprint_folder: renderSprintFolder,
});
