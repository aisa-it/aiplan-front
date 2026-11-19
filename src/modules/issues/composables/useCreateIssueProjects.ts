import { onMounted, onScopeDispose, ref, shallowRef } from 'vue';
import type {
  DtoProjectLight,
  DtoProjectMemberWithLead,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';

import { ProjectService } from '@/services/project.service';
import { UserService } from '@/services/user.service';
import { checkPermissionByProject, defineRole } from '@/utils/permissions';

export const useCreateIssueProjects = (
  workspaceSlug: string,
  initialProject: string | undefined,
  canCreateInWorkspace: boolean,
) => {
  const projects = shallowRef<DtoProjectLight[]>([]);
  const memberships = shallowRef(new Map<string, DtoProjectMemberWithLead>());
  const selectedProjectId = ref<string | null>(null);
  const isLoadingProjects = ref(true);
  const projectLoadFailed = ref(false);
  let disposed = false;

  const getProjectRole = (project: DtoProjectLight) =>
    (project.id ? memberships.value.get(project.id)?.role : undefined) ??
    project.current_user_membership?.role ??
    0;

  const loadProjects = async () => {
    isLoadingProjects.value = true;
    projectLoadFailed.value = false;

    try {
      const available = (
        (await ProjectService.getProjects(workspaceSlug)) ?? []
      ).filter((project) => project.id && !project.archived);
      if (disposed || !available.length) return;

      const ids = available.flatMap(({ id }) => (id ? [id] : []));
      const currentMemberships =
        await UserService.getCurrentUserProjectMemberships(ids).catch(
          () => null,
        );
      if (disposed) return;

      memberships.value = new Map(
        (currentMemberships ?? []).flatMap((member) =>
          member.project_id ? [[member.project_id, member] as const] : [],
        ),
      );
      projects.value = available.filter((project) => {
        const membership = project.id
          ? memberships.value.get(project.id)
          : undefined;
        const role = membership?.is_project_lead
          ? 'lead'
          : defineRole(getProjectRole(project));
        return (
          canCreateInWorkspace || checkPermissionByProject(role, 'create-issue')
        );
      });

      const requestedProject = initialProject?.toLowerCase();
      const current = requestedProject
        ? projects.value.find(
            ({ id, identifier }) =>
              id?.toLowerCase() === requestedProject ||
              identifier?.toLowerCase() === requestedProject,
          )
        : undefined;
      selectedProjectId.value = current?.id ?? projects.value[0]?.id ?? null;
      projectLoadFailed.value =
        !currentMemberships && !canCreateInWorkspace && !projects.value.length;
    } catch {
      if (!disposed) projectLoadFailed.value = true;
    } finally {
      if (!disposed) isLoadingProjects.value = false;
    }
  };

  onMounted(loadProjects);
  onScopeDispose(() => {
    disposed = true;
  });

  return {
    projects,
    selectedProjectId,
    isLoadingProjects,
    projectLoadFailed,
    loadProjects,
    getProjectRole,
  };
};
