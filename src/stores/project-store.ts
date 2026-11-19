import { defineStore } from 'pinia';
import type {
  DtoProject,
  DtoProjectMemberWithLead,
  TypesViewProps,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { ref } from 'vue';
import { ProjectService } from '@/services/project.service';

interface ProjectInfo {
  project: DtoProject;
  membership: DtoProjectMemberWithLead;
}

interface UpdateViewSettingsOptions {
  replace?: boolean;
  optimistic?: boolean;
}

export const useProjectStore = defineStore('project-store', () => {
  const project = ref<DtoProject>();
  const meInProject = ref<DtoProjectMemberWithLead>();
  const isLoading = ref(false);
  let latestProjectRequest = 0;
  let viewSettingsRequest = Promise.resolve();
  const confirmedViewSettings = new Map<string, TypesViewProps | undefined>();
  const viewSettingsVersion = new Map<string, number>();
  const settingsKey = (workspaceSlug: string, projectId: string) =>
    `${workspaceSlug}:${projectId}`;

  const getProjectInfo = async (
    workspaceSlug: string,
    projectId: string,
    signal?: AbortSignal,
  ): Promise<ProjectInfo> => {
    signal?.throwIfAborted();
    const request = ++latestProjectRequest;
    const finish = () => {
      if (request === latestProjectRequest) isLoading.value = false;
    };
    isLoading.value = true;
    signal?.addEventListener('abort', finish, { once: true });

    try {
      const project = await ProjectService.getProject(
        workspaceSlug,
        projectId,
        signal,
      );
      signal?.throwIfAborted();
      const membership = await ProjectService.getMeInProject(
        workspaceSlug,
        projectId,
        signal,
      );
      signal?.throwIfAborted();
      return { project, membership };
    } finally {
      signal?.removeEventListener('abort', finish);
      finish();
    }
  };

  const applyProjectInfo = (
    workspaceSlug: string,
    projectId: string,
    info: ProjectInfo,
  ) => {
    project.value = info.project;
    meInProject.value = info.membership;
    confirmedViewSettings.set(
      settingsKey(workspaceSlug, info.project.id ?? projectId),
      info.membership.view_props,
    );
  };

  const updateViewSettings = async (
    workspaceSlug: string,
    projectId: string,
    patch: TypesViewProps,
    { replace = false, optimistic = true }: UpdateViewSettingsOptions = {},
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
          group_tables_hide: patch.group_tables_hide
            ? {
                ...currentSettings?.group_tables_hide,
                ...patch.group_tables_hide,
              }
            : currentSettings?.group_tables_hide,
        };

    if (optimistic) {
      meInProject.value = { ...meInProject.value, view_props: settings };
    }
    const version = (viewSettingsVersion.get(key) ?? 0) + 1;
    viewSettingsVersion.set(key, version);
    const isCurrent = () =>
      meInProject.value?.project_id === projectId &&
      version === viewSettingsVersion.get(key);
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
      if (!optimistic && isCurrent()) {
        meInProject.value = { ...meInProject.value, view_props: settings };
      }
    } catch (error) {
      if (optimistic && isCurrent()) {
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
    applyProjectInfo,
    updateViewSettings,
  };
});
