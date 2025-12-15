import { defineStore } from 'pinia';

interface GuiderStore {
  activeGuid: number | null;
}

export const useGuiderStore = defineStore('guider-store', {
  state: (): GuiderStore => {
    return {
      activeGuid: null,
    };
  },

  actions: {
    clear() {
      this.activeGuid = null;
    },
    setActiveGuid(step_num: number) {
      this.activeGuid = step_num;
    },
  },
});
