import { defineStore } from 'pinia';

export const useUIStore = defineStore('ui-store', {
  state: () => {
    return {
      menuSidebarWidth: 300,
      previewIssueWidth: 900,
    };
  },
});
