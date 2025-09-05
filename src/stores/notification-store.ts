import { defineStore } from 'pinia';
import { handleNotify } from 'src/utils/notify';
import { INotificationParams } from 'src/interfaces/notifications';

export const useNotificationStore = defineStore('notifications', {
  state: () => {
    return {
      notificationState: null as unknown as INotificationParams,
    };
  },

  getters: {
    getCurrentState: (state) => state.notificationState,
  },

  actions: {
    setNotificationView(view: INotificationParams) {
      handleNotify(view);
    },
  },
});
