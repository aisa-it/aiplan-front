import { ref } from 'vue';
import { DEFAULT_TOAST_TIMEOUT, TOAST_TYPE_CONFIG } from './toast.config';
import type {
  ShowToastOptions,
  ToastMessage,
  ToastMessagePart,
  ToastOptions,
  ToastType,
  ToastView,
} from './toast.types';

const toasts = ref<ToastView[]>([]);
const timers = new Map<string, number>();

let lastToastId = 0;

const normalizeMessage = (message: ToastMessage): ToastView['message'] =>
  typeof message === 'string' ? [message] : [...message];

const getMessageGroupValue = (part: ToastMessagePart) =>
  typeof part === 'string'
    ? ['text', part]
    : ['link', part.text, part.href, part.target ?? '_blank'];

const getGroupKey = (
  type: ToastType,
  title: string,
  message: ToastView['message'],
) => JSON.stringify([type, title, message.map(getMessageGroupValue)]);

const clearToastTimer = (id: string) => {
  const timer = timers.get(id);

  if (timer !== undefined) {
    window.clearTimeout(timer);
    timers.delete(id);
  }
};

export const removeToast = (id: string) => {
  clearToastTimer(id);
  toasts.value = toasts.value.filter((item) => item.id !== id);
};

const startToastTimer = (toast: ToastView) => {
  clearToastTimer(toast.id);

  if (toast.timeout <= 0) return;

  timers.set(
    toast.id,
    window.setTimeout(() => removeToast(toast.id), toast.timeout),
  );
};

export const showToast = ({
  type,
  title,
  message,
  timeout = DEFAULT_TOAST_TIMEOUT,
}: ShowToastOptions) => {
  const config = TOAST_TYPE_CONFIG[type];
  const resolvedTitle = title || config.title;
  const resolvedMessage = normalizeMessage(message || config.message);
  const groupKey = getGroupKey(type, resolvedTitle, resolvedMessage);
  const groupedToastIndex = toasts.value.findIndex(
    (item) => item.groupKey === groupKey,
  );

  if (groupedToastIndex !== -1) {
    const groupedToast = toasts.value[groupedToastIndex];
    const updatedToast = {
      ...groupedToast,
      count: groupedToast.count + 1,
      timeout,
    };

    toasts.value.splice(groupedToastIndex, 1, updatedToast);
    startToastTimer(updatedToast);

    return () => removeToast(updatedToast.id);
  }

  const id = `toast-${++lastToastId}`;
  const newToast: ToastView = {
    id,
    groupKey,
    type,
    title: resolvedTitle,
    message: resolvedMessage,
    icon: config.icon,
    accentColor: config.accentColor,
    count: 1,
    timeout,
  };

  toasts.value.unshift(newToast);
  startToastTimer(newToast);

  return () => removeToast(id);
};

const showTypedToast =
  (type: ToastType) =>
  (message?: ToastMessage, options: ToastOptions = {}) =>
    showToast({ type, message, ...options });

export const toast = {
  show: showToast,
  warning: showTypedToast('warning'),
  message: showTypedToast('message'),
  success: showTypedToast('success'),
  error: showTypedToast('error'),
};

export const useToastStack = () => ({
  toasts,
  removeToast,
});
