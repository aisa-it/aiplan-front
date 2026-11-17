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
  const confirmedViewSettings = new Map<string, TypesViewProps | undefined>();
  const viewSettingsVersion = new Map<string, number>();
  const settingsKey = (workspaceSlug: string, projectId: string) =>
    `${workspaceSlug}:${projectId}`;

  const getProjectInfo = async (workspaceSlug: string, projectId: string) => {
    isLoading.value = true;

    try {
      project.value = await ProjectService.getProject(workspaceSlug, projectId);
      const membership = await ProjectService.getMeInProject(
        workspaceSlug,
        projectId,
      );
      meInProject.value = membership;
      confirmedViewSettings.set(
        settingsKey(workspaceSlug, projectId),
        membership.view_props,
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

    const key = settingsKey(workspaceSlug, projectId);
    const currentSettings = meInProject.value?.view_props;
    if (!confirmedViewSettings.has(key)) {
      confirmedViewSettings.set(key, currentSettings);
    }
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
    const version = (viewSettingsVersion.get(key) ?? 0) + 1;
    viewSettingsVersion.set(key, version);
    const request = viewSettingsRequest.then(async () => {
      await ProjectService.updateViewSettings(
        workspaceSlug,
        projectId,
        settings,
      );
      confirmedViewSettings.set(key, settings);
    });
    viewSettingsRequest = request.catch(() => undefined);
    try {
      await request;
    } catch (error) {
      if (
        meInProject.value?.project_id === projectId &&
        version === viewSettingsVersion.get(key)
      ) {
        meInProject.value = {
          ...meInProject.value,
          view_props: confirmedViewSettings.get(key),
        };
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
