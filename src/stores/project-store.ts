import { defineStore } from 'pinia';
import type {
  DtoProject,
  DtoProjectMemberWithLead,
  TypesViewProps,
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

  const updateViewSettings = async (
    workspaceSlug: string,
    projectId: string,
    patch: TypesViewProps,
  ) => {
    if (meInProject.value?.project_id !== projectId) return;

    const currentSettings = meInProject.value?.view_props;
    const settings: TypesViewProps = {
      ...currentSettings,
      ...patch,
      filters:
        currentSettings?.filters || patch.filters
          ? {
              ...currentSettings?.filters,
              ...patch.filters,
            }
          : undefined,
    };

    await projectService.updateViewSettings(
      workspaceSlug,
      projectId,
      settings,
    );

    if (meInProject.value?.project_id === projectId) {
      meInProject.value = {
        ...meInProject.value,
        view_props: settings,
      };
    }
  };

  return {
    project,
    meInProject,
    isLoading,
    getProjectInfo,
    updateViewSettings,
  };
});
