import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';

import { useUserStore } from 'src/stores/user-store';
import { useWorkspaceStore } from 'src/stores/workspace-store';

export function useUserActivityNavigation() {
  const router = useRouter();

  const userStore = useUserStore();
  const workspaceStore = useWorkspaceStore();

  const { user } = storeToRefs(userStore);
  const { currentWorkspaceSlug } = storeToRefs(workspaceStore);

  const navigateToActivityPage = (userId?: string) => {
    if (!userId) return
    const currentUserId = user?.value.id;

    if (userId === currentUserId) {
      router.push({
        path: '/profile',
      });
    } else if (currentWorkspaceSlug.value) {
      router.push({
        path: `/${currentWorkspaceSlug.value}/user-activities/${userId}`,
      });
    }
  };

  return {
    navigateToActivityPage,
  };
}
