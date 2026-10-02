import type { NavigationGuard } from 'vue-router';

import { useUserStore } from '@/stores/user-store';
import { useWorkspacesStore } from '@/stores/workspaces-store';

export const redirectToWorkspaceGuard: NavigationGuard = () => {
  const userStore = useUserStore();
  const workspacesStore = useWorkspacesStore();
  const workspaces = workspacesStore.workspaces;
  const slug = userStore.user?.last_workspace_slug || workspaces[0]?.slug;

  if (slug) {
    return {
      name: 'general-workspace',
      params: { workspace: slug },
    };
  }
};
