import { defineStore } from 'pinia';
import type {
  DtoProject,
  DtoProjectMemberWithLead,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { ref } from 'vue';
import { ProjectService } from '@/services/project.service';

export const useProjectStore = defineStore('project-store', () => {
  const project = ref<DtoProject>();
  const meInProject = ref<DtoProjectMemberWithLead>();
  const isLoading = ref(false);

  const getProjectInfo = async (workspaceSlug: string, projectId: string) => {
    isLoading.value = true;

    try {
      project.value = await ProjectService.getProject(workspaceSlug, projectId);
      meInProject.value = await ProjectService.getMeInProject(
        workspaceSlug,
        projectId,
      );
    } finally {
      isLoading.value = false;
    }
  };

  return {
    project,
    meInProject,
    isLoading,
    getProjectInfo,
  };
});
