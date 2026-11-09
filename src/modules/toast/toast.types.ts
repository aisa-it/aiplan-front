export type ToastType = 'warning' | 'message' | 'success' | 'error';

export interface ToastLink {
  text: string;
  href: string;
  target?: '_blank' | '_self';
}

export type ToastMessagePart = string | ToastLink;
export type ToastMessage = string | readonly ToastMessagePart[];

export interface ToastOptions {
  title?: string;
  timeout?: number;
}

export interface ShowToastOptions extends ToastOptions {
  type: ToastType;
  message?: ToastMessage;
}

export interface ToastView {
  id: string;
  groupKey: string;
  type: ToastType;
  title: string;
  message: readonly ToastMessagePart[];
  icon: string;
  accentColor: string;
  count: number;
  timeout: number;
}
