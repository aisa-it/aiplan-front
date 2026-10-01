import type { NavigationGuard } from 'vue-router';
import { useUserStore } from '@/stores/user-store';
import { useWorkspacesStore } from '@/stores/workspaces-store';

export const mainGuard: NavigationGuard = async (to) => {
  const userStore = useUserStore();
  const workspacesStore = useWorkspacesStore();

  try {
    await userStore.getUserInfo();
    await workspacesStore.getUserWorkspaces();
  } catch {
    return '/signin';
  }

  if (!userStore.user?.is_onboarded) {
    return '/onboarding';
  }

  if (!to.params.workspace && to.name === 'general-workspace') {
    const workspaces = workspacesStore.workspaces;
    const slug = userStore.user?.last_workspace_slug || workspaces[0]?.slug;

    if (slug) return `/${slug}`;
  }
};
