import type { NavigationGuard } from 'vue-router';

import { loadProjectGuard } from './load-project.guard';
import { loadWorkspaceGuard } from './load-workspace.guard';

export const resolveProjectGuard: NavigationGuard = async (to, from) => {
  if (
    to.name !== 'project' ||
    (from.name === 'project' &&
      to.params.workspace === from.params.workspace &&
      to.params.project === from.params.project)
  ) {
    return;
  }

  const workspaceResult = await loadWorkspaceGuard(to);
  if (workspaceResult) return workspaceResult;

  return loadProjectGuard(to);
};
