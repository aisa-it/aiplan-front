import { defineStore } from 'pinia';

export const useSocketStore = defineStore('socket', {
  state: () => ({
    isConnected: false,
    message: '',
    heartBeatInterval: 50000,
    heartBeatTimer: 0,
  }),
  actions: {
    onOpen(event: any) {
      console.log('successful websocket connection', event);

      this.isConnected = true;
      this.heartBeatTimer = window.setInterval(() => {
        console.log('checked');
      }, this.heartBeatInterval);
    },

    onClose(event: any) {
      this.isConnected = false;
      window.clearInterval(this.heartBeatTimer);
      this.heartBeatTimer = 0;
      console.log('closed at: ' + new Date());
      console.log(event);
    },

    onError(event: any) {
      console.error(event);
    },

    onMessage(message: any) {
      this.message = message;
    },
  },
});
