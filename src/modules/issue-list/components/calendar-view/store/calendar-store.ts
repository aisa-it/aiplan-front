import { defineStore } from 'pinia';
import { addDays, buildDateRange, getWeekStart } from '../utils/dateRange';

export type CalendarViewMode = 'week' | 'month' | 'year';

export const useCalendarStore = defineStore('calendar', {
  state: () => ({
    currentDate: new Date(),
    viewMode: 'week' as CalendarViewMode,
  }),

  getters: {
    visibleRange(state) {
      const base = new Date(state.currentDate);

      if (state.viewMode === 'week') {
        const from = getWeekStart(base);
        const to = addDays(from, 6);
        return { from, to };
      }

      if (state.viewMode === 'month') {
        const from = new Date(base.getFullYear(), base.getMonth(), 1);
        const to = new Date(base.getFullYear(), base.getMonth() + 1, 0);
        return { from, to };
      }

      const from = new Date(base.getFullYear(), 0, 1);
      const to = new Date(base.getFullYear(), 11, 31);
      return { from, to };
    },

    visibleDates(): Date[] {
      const { from, to } = this.visibleRange;
      return buildDateRange(from, to);
    },
  },

  actions: {
    setDate(date: Date) {
      this.currentDate = date;
    },

    setViewMode(mode: CalendarViewMode) {
      this.viewMode = mode;
    },

    next(forView?: CalendarViewMode) {
      this.currentDate = this.shiftDate(1, forView);
    },

    prev(forView?: CalendarViewMode) {
      this.currentDate = this.shiftDate(-1, forView);
    },

    shiftDate(direction: 1 | -1, forView?: CalendarViewMode) {
      const d = new Date(this.currentDate);

      let viewMode = this.viewMode;
      if (forView) viewMode = forView;

      if (viewMode === 'week') {
        d.setDate(d.getDate() + direction * 7);
      } else if (viewMode === 'month') {
        d.setMonth(d.getMonth() + direction);
      } else {
        d.setFullYear(d.getFullYear() + direction);
      }

      return d;
    },
  },
});
