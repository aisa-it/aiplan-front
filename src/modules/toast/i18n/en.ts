import type ru from './ru';

export default {
  titles: { warning: 'Information', message: 'Notification', success: 'Success', error: 'Error' },
  fallback: { success: 'Data updated', error: 'Please try again' },
  notifications: 'Notifications',
  closeNotification: 'Close notification',
} satisfies typeof ru;
