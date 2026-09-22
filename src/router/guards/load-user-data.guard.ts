import type { NavigationGuard } from 'vue-router';

import { useUserStore } from '@/stores/user-store';
import { useWorkspacesStore } from '@/stores/workspaces-store';

export const loadUserDataGuard: NavigationGuard = async () => {
  const userStore = useUserStore();
  const workspacesStore = useWorkspacesStore();

  try {
    await userStore.getUserInfo();
    await workspacesStore.getUserWorkspaces();
  } catch {
    return '/signin';
  }
};
