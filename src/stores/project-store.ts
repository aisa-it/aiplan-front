import { defineStore } from 'pinia';
import type {
  DtoProject,
  DtoProjectMemberWithLead,
  TypesViewProps,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { ref } from 'vue';
import { ProjectService } from '@/services/project.service';

export const useProjectStore = defineStore('project-store', () => {
  const project = ref<DtoProject>();
  const meInProject = ref<DtoProjectMemberWithLead>();
  const isLoading = ref(false);
  let viewSettingsRequest = Promise.resolve();
  let viewSettingsVersion = 0;

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

  const updateViewSettings = async (
    workspaceSlug: string,
    projectId: string,
    patch: TypesViewProps,
    replace = false,
  ) => {
    if (meInProject.value?.project_id !== projectId) return;

    const currentSettings = meInProject.value?.view_props;
    const settings: TypesViewProps = replace
      ? patch
      : {
          ...currentSettings,
          ...patch,
          filters:
            currentSettings?.filters || patch.filters
              ? { ...currentSettings?.filters, ...patch.filters }
              : undefined,
        };

    meInProject.value = { ...meInProject.value, view_props: settings };
    const version = ++viewSettingsVersion;
    const request = viewSettingsRequest.then(() =>
      ProjectService.updateViewSettings(workspaceSlug, projectId, settings),
    );
    viewSettingsRequest = request.catch(() => undefined);
    try {
      await request;
    } catch (error) {
      if (
        meInProject.value?.project_id === projectId &&
        version === viewSettingsVersion
      ) {
        meInProject.value = { ...meInProject.value, view_props: currentSettings };
      }
      throw error;
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
