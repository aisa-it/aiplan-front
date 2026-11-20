import type { NavigationGuard } from 'vue-router';

import { loadProjectGuard } from './load-project.guard';

export const resolveProjectGuard: NavigationGuard = (to, from) => {
  if (
    to.name !== 'project' ||
    (from.name === 'project' &&
      to.params.workspace === from.params.workspace &&
      to.params.project === from.params.project)
  ) {
    return;
  }

  return loadProjectGuard(to);
};
