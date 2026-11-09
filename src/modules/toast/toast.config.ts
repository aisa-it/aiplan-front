import type { MessageKey } from '@/i18n';
import type { ToastType } from './toast.types';

interface ToastTypeConfig {
  titleKey: MessageKey;
  fallbackKey: MessageKey;
  icon: string;
  accentColor: string;
}

export const DEFAULT_TOAST_TIMEOUT = 5000;

export const TOAST_TYPE_CONFIG: Record<ToastType, ToastTypeConfig> = {
  warning: {
    titleKey: 'toast.titles.warning',
    fallbackKey: 'toast.fallback.success',
    icon: 'info',
    accentColor: '#f2c037', // FIXME: Убрать магические значения, вынести в глобальные переменные или стили
  },
  message: {
    titleKey: 'toast.titles.message',
    fallbackKey: 'toast.fallback.success',
    icon: 'info',
    accentColor: 'rgb(var(--v-theme-primary))',
  },
  success: {
    titleKey: 'toast.titles.success',
    fallbackKey: 'toast.fallback.success',
    icon: 'check',
    accentColor: '#05bd8d',
  },
  error: {
    titleKey: 'toast.titles.error',
    fallbackKey: 'toast.fallback.error',
    icon: 'close',
    accentColor: '#dc3e3e',
  },
};
