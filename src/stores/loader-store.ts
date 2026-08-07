import { defineStore } from 'pinia';

export const useLoaderStore = defineStore('loaders', {
  state: () => {
    return {
      tableLoader: false,
      generalLoader: false,
      needFullRefresh: false,
    };
  },
  actions: {
    startLoading() {
      this.generalLoader = true;
    },
    stopLoading() {
      this.generalLoader = false;
    },
    startTableLoading() {
      this.tableLoader = true;
    },
    stopTableLoading() {
      this.tableLoader = false;
    },
    startRefresh() {
      this.needFullRefresh = true;
    },
    stopRefresh() {
      this.needFullRefresh = false;
    },
  },
});
