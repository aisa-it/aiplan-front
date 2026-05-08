import { defineStore } from 'pinia';
import { withInterceptors } from 'src/utils/interceptorsWithInstanceClass';
import { Projects } from '@aisa-it/aiplan-api-ts/src/Projects';

const statesApi = new (withInterceptors(Projects))();

export const useStatesStore = defineStore('states', {
  state: () => {
    return {
      statesCache: {},
    };
  },
  actions: {
    async getStatesByProject(workspaceSLug: string, projectID: string) {
      return statesApi.getStateList(workspaceSLug,projectID)
    },
  },
});
