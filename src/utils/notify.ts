import {  Notify } from 'quasar';
import { INotificationParams } from 'src/interfaces/notifications';
import { BASE_ERROR, SUCCESS_UPDATE_DATA } from 'src/constants/notifications';


export function handleNotify(notify: INotificationParams) {
  switch (notify.type) {
    case 'info':
      return {
        icon: 'check_circle',
        class: 'success-palette',
        title: notify?.customTitle,
        message: notify?.customMessage || SUCCESS_UPDATE_DATA,
      };
    case 'message':
      return Notify.create({
        position: 'top-right',
        timeout: notify.timeout ?? 5000,
        html: true,
        icon: 'info',
        actions: [
          {
            icon: 'close',
            color: 'black',
            round: true,
            handler: () => {
              const element = document.querySelector('.q-notification:last-of-type') as HTMLElement;
              if (element) {
                element.style.transitionDuration = '0.12s';
              }
            },
          },
        ],
        message: `<div class="info-palette">
                      <div class="banner-title">
                        ${notify?.customTitle || 'Уведомление'}
                      </div>
                      <div class="banner-text">
                        ${notify?.customMessage || SUCCESS_UPDATE_DATA}
                      </div>
                  </div>
                `,
      });
    case 'success':
      return Notify.create({
        position: 'top-right',
        timeout: notify.timeout ?? 5000,
        html: true,
        icon: 'check',
        actions: [
          {
            icon: 'close',
            color: 'black',
            round: true,
            handler: () => {
              const element = document.querySelector('.q-notification:last-of-type') as HTMLElement;
              if (element) {
                element.style.transitionDuration = '0.12s';
              }
            },
          },
        ],
        message: `<div class="success-palette">
                      <div class="banner-title">
                        Успешно
                      </div>
                      <div class="banner-text">
                        ${notify?.customMessage || SUCCESS_UPDATE_DATA}
                      </div>
                  </div>
                `,
      });

    case 'error':
      return Notify.create({
        position: 'top-right',
        timeout: notify.timeout ?? 5000,
        html: true,
        icon: 'close',
        actions: [
          {
            icon: 'close',
            color: 'black',
            round: true,
            handler: () => {
              const element = document.querySelector('.q-notification:last-of-type') as HTMLElement;
              if (element) {
                element.style.transitionDuration = '0.12s';
              }
            },
          },
        ],
        message: `<div class="error-palette">
                      <div class="banner-title">
                        Ошибка
                      </div>
                      <div class="banner-text">
                        ${notify?.customMessage || BASE_ERROR}
                      </div>
                  </div>
                `,
      });

    default:
      return {
        icon: 'warning',
        class: 'warning-palette',
        message: 'Что-то пошло не так',
      };
  }
}
