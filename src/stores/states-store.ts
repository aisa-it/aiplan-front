import { defineStore } from 'pinia';
import { useAiplanStore } from './aiplan-store';
import { getStatesList } from 'src/utils/helpers';
import { withInterceptors } from 'src/utils/interceptorsWithInstanceClass';
import { Projects } from '@aisa-it/aiplan-api-ts/src/Projects';

const statesApi = new (withInterceptors(Projects))();
const aiplan = useAiplanStore();

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
      return statesApi.getStateList(workspaceSLug,projectID)
    },
    setDraggingState(state: string) {
      this.draggingState = state
    }
  },
});
