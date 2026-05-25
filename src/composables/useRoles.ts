import { Users } from '@aisa-it/aiplan-api-ts/src/Users';
import { createGlobalState } from '@vueuse/core';
import { withInterceptors } from 'src/utils/interceptorsWithInstanceClass';
import { ref, computed, Ref } from 'vue';

type WorkspaceRoles = 'owner' | 'admin' | 'member' | 'guest';
type ProjectRoles = 'owner' | 'admin' | 'member' | 'guest';
type IssueRoles = 'author' | 'assignee' | 'watcher';

const api = new (withInterceptors(Users))();

export const useRoles = createGlobalState(() => {
  const workspaceRole: WorkspaceRoles | Ref<undefined> = ref(undefined);
  const projectRole: ProjectRoles | Ref<undefined> = ref(undefined);
  const issueRole: IssueRoles | Ref<undefined> = ref(undefined);

  const userWorkspacesMemberships = ref();
  const userProjectsMemberships = ref();
  async function getUserWorkspacesMemberships() {
    try {
      const { data } = await api.getCurrentUserWorkspaceMemberships([]);
      userWorkspacesMemberships.value = {};

      data.forEach((el) => {
        if (el.workspace_id)
          userWorkspacesMemberships.value[el.workspace_id] = el;
      });
    } catch (e) {
      console.error(e);
    }
  }

  async function getUserProjectsMemberships() {
    try {
      const { data } = await api.getCurrentUserProjectMemberships([]);
      userProjectsMemberships.value = {};

      data.forEach((el) => {
        if (el.workspace_id)
          userProjectsMemberships.value[el.workspace_id] = el;
      });
    } catch (e) {
      console.error(e);
    }
  }

  // function getWorkspaceRole() {}

  return {
    getUserWorkspacesMemberships,
    getUserProjectsMemberships,
    userWorkspacesMemberships,
    userProjectsMemberships,
  };
});
