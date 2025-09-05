import { defineStore } from 'pinia';
import { useAiplanStore } from './aiplan-store';
import { getStatesList } from 'src/utils/helpers';
import { API_WORKSPACES_PREFIX } from 'src/constants/apiPrefix';

const aiplan = useAiplanStore();
const api = aiplan.api;

export const useStatesStore = defineStore('states', {
  state: () => {
    return {
      projectId: '',
      states: {},
      statesCache: {},
      draggingState: '' as string,
    };
  },
  actions: {
    async getStates(projectId: string) {
      // if (projectId === this.projectId && this.states !== undefined) {
      //   return this.states;
      // }
      this.projectId = projectId;
      return await this.refresh();
    },
    async refresh() {
      if (this.projectId === '') {
        return;
      }
      return await aiplan.getStates(this.projectId).then(({ data }) => {
        this.states = data;
        return this.states;
      });
    },
    async getStatesList(projectId: string, onlyActive: boolean) {
      return this.getStates(projectId).then(() =>
        getStatesList(this.states, onlyActive),
      );
    },
    async getStatesByProject(workspaceSLug: string, projectID: string) {
      return api.get(
        `${API_WORKSPACES_PREFIX}/${workspaceSLug}/projects/${projectID}/states/`,
      );
    },
    setDraggingState(state: string) {
      this.draggingState = state
    }
  },
});
