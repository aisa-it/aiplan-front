import { defineStore } from 'pinia';
import mitt from 'mitt';

export const useGroupsEventsStore = defineStore('groups-events', {
    state: () => {
        return {
            bus: mitt(),
        };
    },
    actions: {
        sub(group: string, handler) {
            this.bus.on('refresh', (event) => {
                if (event == 'all' || event === group) handler();
            });
        },
        unSub() {
            this.bus.off('refresh');
        },
        refreshAll() {
            this.bus.emit('refresh', 'all');
        },
        refresh(group: string) {
            this.bus.emit('refresh', group)
        },
        reset() {
            this.bus.all.clear();
        }
    }
});