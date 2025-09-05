export interface INotification {
  icon: string;
  class: string;
  title?: string;
  message: string;
  background?: string;
}

export interface INotificationParams {
  open: boolean;
  type: string;
  customTitle?: string;
  customMessage?: string;
  logs?: any[];
  timeout?: number;
}

export interface IMigrationError {
  type: string;
  error: string;
  src_issue_id: string;
}
