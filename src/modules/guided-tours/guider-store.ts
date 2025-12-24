import { defineStore } from 'pinia';

interface GuiderStore {
  activeGuid: number | null;
  filtersListPopap: boolean;
}

export const useGuiderStore = defineStore('guider-store', {
  state: (): GuiderStore => {
    return {
      activeGuid: null,
      filtersListPopap: false,
    };
  },

  actions: {
    clear() {
      this.activeGuid = null;
    },
    setActiveGuid(step_num: number) {
      this.activeGuid = step_num;
    },
    openFiltersList() {
      this.filtersListPopap = true;
    },
    closeFiltersList() {
      this.filtersListPopap = false;
    },
  },
});
