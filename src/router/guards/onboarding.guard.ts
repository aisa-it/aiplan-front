import type { NavigationGuard } from 'vue-router';
import { useUserStore } from '@/stores/user-store';
import { useWorkspacesStore } from '@/stores/workspaces-store';

export const onboardingGuard: NavigationGuard = async () => {
  const userStore = useUserStore();

  try {
    await userStore.getUserInfo();
  } catch {
    return '/signin';
  }

  if (userStore.user?.is_onboarded) {
    const workspacesStore = useWorkspacesStore();
    await workspacesStore.getUserWorkspaces();
    const workspaces = workspacesStore.workspaces;
    const slug = userStore.user?.last_workspace_slug || workspaces[0]?.slug;

    return slug ? `/${slug}` : '/';
  }
};
