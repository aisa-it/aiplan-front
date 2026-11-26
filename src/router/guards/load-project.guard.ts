import type { NavigationHookAfter, RouteLocationNormalized } from 'vue-router';
import { storeToRefs } from 'pinia';

import { useProjectStore } from '@/stores/project-store';
import { useUserStore } from '@/stores/user-store';
import { getStringParam } from '@/utils/object';
import { checkPermissionByProject, defineRole } from '@/utils/permissions';
import { getRouteLoadSignal } from './route-load';

const resolvedProjects = new WeakMap<RouteLocationNormalized, () => void>();

export const applyLoadedProject: NavigationHookAfter = (to, _from, failure) => {
  const apply = resolvedProjects.get(to);
  resolvedProjects.delete(to);
  if (!failure) apply?.();
};

export const loadProjectGuard = async (to: RouteLocationNormalized) => {
  const workspace = getStringParam(to.params.workspace);
  const project = getStringParam(to.params.project);

  if (!workspace || !project) {
    return { name: 'not-found' };
  }

  const projectStore = useProjectStore();
  const { projectRoleName } = storeToRefs(useUserStore());
  const signal = getRouteLoadSignal(to);

  try {
    const info = await projectStore.getProjectInfo(workspace, project, signal);
    if (signal?.aborted) return;
    const role = info.membership.is_project_lead
      ? 'lead'
      : defineRole(info.membership.role ?? 0);

    if (!checkPermissionByProject(role, 'show-project')) {
      window.location.href = '/access-denied';
      return false;
    }
    resolvedProjects.set(to, () => {
      projectStore.applyProjectInfo(workspace, project, info);
      projectRoleName.value = role;
    });
  } catch (error: any) {
    if (signal?.aborted) return;
    if (error?.response?.status === 404) {
      return { name: 'not-found' };
    }

    throw error;
  }
};
