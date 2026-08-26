import { defineStore } from 'pinia';
import type {
  DtoProject,
  DtoProjectMemberWithLead,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { ref } from 'vue';
import { projectService } from '@/services/project-service';
import { useRolesStore } from './roles-store';

export const useProjectStore = defineStore('project-store', () => {
  const project = ref<DtoProject>();
  const meInProject = ref<DtoProjectMemberWithLead>();
  const isLoading = ref(false);

  const getProjectInfo = async (workspaceSlug: string, projectId: string) => {
    const rolesStore = useRolesStore();

    isLoading.value = true;

    try {
      project.value = await projectService.getProject(workspaceSlug, projectId);
      meInProject.value = await projectService.getMeInProject(
        workspaceSlug,
        projectId,
      );
    } finally {
      isLoading.value = false;
    }

    rolesStore.setProjectRole(meInProject.value);

    if (!rolesStore.hasPermissionByProject(meInProject.value, 'show-project')) {
      window.location.href = '/access-denied';
    }
  };

  return {
    project,
    isLoading,
    getProjectInfo,
  };
});
