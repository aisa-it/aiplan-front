import { defineStore } from 'pinia';
import {
  addDays,
  buildDateRange,
  getMonthStart,
  getWeekStart,
} from '../utils/dateRange';
import { CalendarTransitionDirection } from '../types/calendar';

export type CalendarViewMode = 'week' | 'month' | 'year';

export const useCalendarStore = defineStore('calendar', {
  state: () => ({
    currentDate: new Date(),
    viewMode: 'week' as CalendarViewMode,
    transitionDirection: 'forward' as CalendarTransitionDirection,
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
        const from = getMonthStart(base);
        const to = addDays(from, 41);
        return { from, to };
      }

      const from = new Date(base.getFullYear(), 0, 1);
      const to = new Date(base.getFullYear(), 11, 31);
      return { from, to };
    },

    visibleDates(): Date[] {
      if (this.viewMode === 'year') return [];

      const { from, to } = this.visibleRange;
      return buildDateRange(from, to);
    },

    visibleMonths(): Date[] {
      if (this.viewMode !== 'year') return [];

      const year = this.currentDate.getFullYear();
      return Array.from({ length: 12 }, (_, month) => new Date(year, month, 1));
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
      this.transitionDirection = 'forward';
      this.currentDate = this.shiftDate(1, forView);
    },

    prev(forView?: CalendarViewMode) {
      this.transitionDirection = 'backward';
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
