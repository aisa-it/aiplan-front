import { createActivityRenderer } from '../../create-activity-renderer';
import {
  renderChildDocAdded,
  renderChildDocRemoved,
  renderDocCreated,
  renderDocDeleted,
  renderDocSort,
} from './doc';
import { renderWorkspaceForm } from './form';
import {
  renderIntegrationAdded,
  renderIntegrationRemoved,
} from './integration';
import {
  renderMemberAdded,
  renderMemberRemoved,
  renderMemberRole,
} from './member';
import { renderProject } from './project';
import {
  renderWorkspaceName,
  renderWorkspaceOwner,
  renderWorkspaceProperty,
} from './property';
import {
  renderSprint,
  renderSprintFolder,
  renderSprintFolderName,
} from './sprint';

export const renderWorkspaceActivity = createActivityRenderer({
  logo: renderWorkspaceProperty('workspaceActivity.properties.avatar'),
  name: renderWorkspaceName,
  integration_token: renderWorkspaceProperty(
    'workspaceActivity.properties.token',
  ),
  member: {
    added: renderMemberAdded,
    removed: renderMemberRemoved,
  },
  role: renderMemberRole,
  description: renderWorkspaceProperty(
    'workspaceActivity.properties.description',
  ),
  owner: renderWorkspaceOwner,
  doc: {
    created: renderDocCreated,
    deleted: renderDocDeleted,
    added: renderChildDocAdded,
    removed: renderChildDocRemoved,
  },
  doc_sort: renderDocSort,
  form: {
    created: renderWorkspaceForm,
    deleted: renderWorkspaceForm,
  },
  project: {
    created: renderProject,
    deleted: renderProject,
  },
  integration: {
    added: renderIntegrationAdded,
    removed: renderIntegrationRemoved,
  },
  sprint: {
    created: renderSprint,
    deleted: renderSprint,
  },
  sprint_folder: {
    created: renderSprintFolder,
    deleted: renderSprintFolder,
  },
  sprint_folder_name: {
    updated: renderSprintFolderName,
  },
});
