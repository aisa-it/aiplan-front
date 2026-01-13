import { Notify } from 'quasar';
import { INotificationParams } from 'src/interfaces/notifications';
import {
  BASE_ERROR,
  BASE_ERROR_MESSAGE,
  SUCCESS_UPDATE_DATA,
} from 'src/constants/notifications';

export function handleNotify(notify: INotificationParams) {
  switch (notify.type) {
    case 'warning':
      return createNotification(notify, {
        icon: 'info',
        paletteClass: 'warning-palette',
        defaultTitle: 'Информация',
        defaultMessage: SUCCESS_UPDATE_DATA,
      });

    case 'message':
      return createNotification(notify, {
        icon: 'info',
        paletteClass: 'info-palette',
        defaultTitle: 'Уведомление',
        defaultMessage: SUCCESS_UPDATE_DATA,
      });

    case 'success':
      return createNotification(notify, {
        icon: 'check',
        paletteClass: 'success-palette',
        defaultTitle: 'Успешно',
        defaultMessage: SUCCESS_UPDATE_DATA,
      });

    case 'error':
      return createNotification(notify, {
        icon: 'close',
        paletteClass: 'error-palette',
        defaultTitle: 'Ошибка',
        defaultMessage: BASE_ERROR,
      });

    default:
      return createNotification(notify, {
        icon: 'warning',
        paletteClass: 'error-palette',
        defaultTitle: 'Упс...',
        defaultMessage: BASE_ERROR_MESSAGE,
      });
  }
}

function createNotification(
  notify: INotificationParams,
  config: {
    icon: string;
    paletteClass: string;
    defaultTitle: string;
    defaultMessage: string;
  },
) {
  return Notify.create({
    position: 'top-right',
    timeout: notify.timeout ?? 5000,
    html: true,
    icon: config.icon,
    actions: [
      {
        icon: 'close',
        color: 'black',
        round: true,
        handler: () => {
          const element = document.querySelector(
            '.q-notification:last-of-type',
          ) as HTMLElement;
          if (element) {
            element.style.transitionDuration = '0.12s';
          }
        },
      },
    ],
    message: `<div class="${config.paletteClass}">
                  <div class="banner-title">
                    ${notify?.customTitle || config.defaultTitle}
                  </div>
                  <div class="banner-text">
                    ${notify?.customMessage || config.defaultMessage}
                  </div>
              </div>
            `,
  });
}
