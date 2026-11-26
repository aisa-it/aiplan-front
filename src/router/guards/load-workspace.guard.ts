import type { NavigationGuard } from 'vue-router';
import { storeToRefs } from 'pinia';

import { useUserStore } from '@/stores/user-store';
import { useWorkspaceStore } from '@/stores/workspace-store';
import { getStringParam } from '@/utils/object';
import { checkPermissionByWs, defineRole } from '@/utils/permissions';
import { getRouteLoadSignal } from './route-load';

let latestWorkspaceLoad = 0;

export const loadWorkspaceGuard: NavigationGuard = async (to) => {
  const workspace = getStringParam(to.params.workspace);
  if (!workspace) return;

  const workspaceStore = useWorkspaceStore();

  const { isLoading, meInWorkspace, workspaceInfo } =
    storeToRefs(workspaceStore);
  const { workspaceRoleName } = storeToRefs(useUserStore());

  if (workspaceInfo.value?.slug === workspace) {
    return;
  }

  const signal = getRouteLoadSignal(to);
  if (signal?.aborted) return;
  const request = ++latestWorkspaceLoad;
  const finish = () => {
    if (request === latestWorkspaceLoad) isLoading.value = false;
  };
  signal?.addEventListener('abort', finish, { once: true });
  try {
    isLoading.value = true;

    await workspaceStore.getWorkspaceInfo(workspace, signal);
    if (signal?.aborted) return;

    if (meInWorkspace.value.is_workspace_owner) {
      workspaceRoleName.value = 'owner';
    } else {
      workspaceRoleName.value = defineRole(meInWorkspace.value.role ?? 0);
    }

    if (!checkPermissionByWs(workspaceRoleName.value, 'show-ws')) {
      window.location.href = '/access-denied';
    }
  } catch (error: any) {
    if (signal?.aborted) return;
    if (error?.response?.status == 404) {
      return { name: 'not-found' };
    }

    throw error;
  } finally {
    signal?.removeEventListener('abort', finish);
    finish();
  }
};
