import type { ToastType } from '../toast.types';

export default {
  titles: {
    warning: 'Информация',
    message: 'Уведомление',
    success: 'Успешно',
    error: 'Ошибка',
  } satisfies Record<ToastType, string>,
  fallback: {
    success: 'Данные обновлены',
    error: 'Пожалуйста, попробуйте еще раз',
  },
  notifications: 'Уведомления',
  closeNotification: 'Закрыть уведомление',
};
