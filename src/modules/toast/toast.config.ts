import { SUCCESS_UPDATE_DATA, BASE_ERROR } from '@/constants/notifications';
import type { ToastType } from './toast.types';

interface ToastTypeConfig {
  title: string;
  message: string;
  icon: string;
  accentColor: string;
}

export const DEFAULT_TOAST_TIMEOUT = 5000;

export const TOAST_TYPE_CONFIG: Record<ToastType, ToastTypeConfig> = {
  warning: {
    title: 'Информация',
    message: SUCCESS_UPDATE_DATA,
    icon: 'info',
    accentColor: '#f2c037',
  },
  message: {
    title: 'Уведомление',
    message: SUCCESS_UPDATE_DATA,
    icon: 'info',
    accentColor: 'rgb(var(--v-theme-primary))',
  },
  success: {
    title: 'Успешно',
    message: SUCCESS_UPDATE_DATA,
    icon: 'check',
    accentColor: '#05bd8d',
  },
  error: {
    title: 'Ошибка',
    message: BASE_ERROR,
    icon: 'close',
    accentColor: '#dc3e3e',
  },
};
