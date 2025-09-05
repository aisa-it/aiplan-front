import { defineStore } from 'pinia';

interface deleteRoleDialogProps {
  show: boolean;
  wsId: string | undefined;
  projectId: string | undefined;
  userId: string | undefined;
  resolvePromise: ((success: boolean) => void) | null;
}

export const useDeleteRoleDialogStore = defineStore('deleteRoleDialogStore', {
  state: (): deleteRoleDialogProps => ({
    show: false,
    wsId: undefined,
    projectId: undefined,
    userId: undefined,
    resolvePromise: null,
  }),
  actions: {
    showDialog(
      userId: string,
      wsId: string,
      projectId?: string,
    ): Promise<boolean> {
      this.userId = userId;
      this.wsId = wsId;
      this.projectId = projectId;
      this.show = true;

      return new Promise((resolve) => {
        this.resolvePromise = resolve;
      });
    },

    closeDialog() {
      if (this.resolvePromise) {
        this.resolvePromise(false);
      }
      this.reset();
    },

    success() {
      if (this.resolvePromise) {
        this.resolvePromise(true);
      }
      this.reset();
    },

    reset() {
      this.userId = undefined;
      this.wsId = undefined;
      this.projectId = undefined;
      this.show = false;
    },
  },
});
