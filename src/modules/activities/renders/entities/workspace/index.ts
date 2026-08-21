import { createActivityRenderer } from '../../create-activity-renderer';
import {
  renderChildDocAdded,
  renderChildDocRemoved,
  renderDocCreated,
  renderDocDeleted,
  renderDocSort,
  renderWorkspaceForm,
} from './content';
import {
  renderMemberAdded,
  renderMemberRemoved,
  renderMemberRole,
} from './members';
import {
  renderWorkspaceName,
  renderWorkspaceOwner,
  renderWorkspaceProperty,
} from './settings';
import {
  renderIntegrationAdded,
  renderIntegrationRemoved,
  renderProject,
  renderSprint,
  renderSprintFolder,
  renderSprintFolderName,
} from './structure';

export const renderWorkspaceActivity = createActivityRenderer({
  logo: renderWorkspaceProperty('аватар'),
  name: renderWorkspaceName,
  integration_token: renderWorkspaceProperty('токен'),
  member: {
    added: renderMemberAdded,
    removed: renderMemberRemoved,
  },
  role: renderMemberRole,
  description: renderWorkspaceProperty('описание'),
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
