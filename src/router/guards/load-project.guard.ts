import type { NavigationGuard } from 'vue-router';
import { storeToRefs } from 'pinia';

import { useProjectStore } from '@/stores/project-store';
import { useUserStore } from '@/stores/user-store';
import { getStringParam } from '@/utils/object';
import { checkPermissionByProject, defineRole } from '@/utils/permissions';

export const loadProjectGuard: NavigationGuard = async (to) => {
  const workspace = getStringParam(to.params.workspace);
  const project = getStringParam(to.params.project);

  if (!workspace || !project) {
    return { name: 'not-found' };
  }

  const projectStore = useProjectStore();
  const { projectRoleName } = storeToRefs(useUserStore());
  const { meInProject } = storeToRefs(projectStore);

  try {
    await projectStore.getProjectInfo(workspace, project);

    if (meInProject.value?.is_project_lead) {
      projectRoleName.value = 'lead';
    } else {
      projectRoleName.value = defineRole(meInProject.value?.role ?? 0);
    }

    if (!checkPermissionByProject(projectRoleName.value, 'show-project')) {
      window.location.href = '/access-denied';
    }
  } catch (error: any) {
    if (error?.response?.status === 404) {
      return { name: 'not-found' };
    }

    throw error;
  }
};
