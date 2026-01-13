import clock from './icons/clock.svg';
import run from './icons/run.svg';
import check from './icons/check.svg';
import cancel from './icons/cancel.svg';
import alert from './icons/alert.svg';

export const STATUS_ICONS: Record<string, string> = {
  unstarted: clock,
  backlog: clock,
  started: run,
  completed: check,
  cancelled: cancel,
  overdue: alert,
};
