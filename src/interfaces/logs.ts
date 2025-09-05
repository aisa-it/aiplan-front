export type LogType = 'error' | 'print' | 'success' | 'fail';

export interface ILogsFilter {
  select: LogType[];
}
