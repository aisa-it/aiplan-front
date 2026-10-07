import type { NavigationGuard } from 'vue-router';
import { storeToRefs } from 'pinia';

import { useUserStore } from '@/stores/user-store';
import { useWorkspaceStore } from '@/stores/workspace-store';
import { getStringParam } from '@/utils/object';
import { checkPermissionByWs, defineRole } from '@/utils/permissions';

export const loadWorkspaceGuard: NavigationGuard = async (to) => {
  const workspace = getStringParam(to.params.workspace);

  if (!workspace) {
    return { name: 'not-found' };
  }

  const workspaceStore = useWorkspaceStore();

  const { isLoading, meInWorkspace, workspaceInfo } =
    storeToRefs(workspaceStore);
  const { workspaceRoleName } = storeToRefs(useUserStore());

  if (workspaceInfo.value?.slug === workspace) {
    return;
  }

  try {
    isLoading.value = true;

    await workspaceStore.getWorkspaceInfo(workspace);

    if (meInWorkspace.value.is_workspace_owner) {
      workspaceRoleName.value = 'owner';
    } else {
      workspaceRoleName.value = defineRole(meInWorkspace.value.role ?? 0);
    }

    if (!checkPermissionByWs(workspaceRoleName.value, 'show-ws')) {
      window.location.href = '/access-denied';
    }

    workspaceStore.getWorkspaceProjects(workspace);
  } catch (error: any) {
    if (error?.response?.status == 404) {
      return { name: 'not-found' };
    }

    throw error;
  } finally {
    isLoading.value = false;
  }
};
