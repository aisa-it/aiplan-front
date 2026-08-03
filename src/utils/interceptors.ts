import type { AxiosInstance, AxiosResponse } from 'axios';
import { NON_VALIDATED_ROUTES } from '@/constants/constants';
import { NOT_FOUND_ERROR_CODES } from '@/constants/notFoundErrorCodes';
import { allowedNotFoundServices } from '@/utils/validation';
// import { handleNotify } from './notify';

const validateRouteCheck = (route: string): boolean =>
  NON_VALIDATED_ROUTES.includes(route);

/**
 * Применяет interceptor'ы к переданному экземпляру Axios
 */
export function applyInterceptors(instance: AxiosInstance): AxiosInstance {
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      const url = response.config.url;
      if (
        url &&
        (url.endsWith('/api/auth/sign-out/') ||
          url.endsWith('/api/auth/sign-out-everywhere/'))
      ) {
        window.location.href = '/signin';
      }
      return response;
    },
    async (error) => {
      const res = error?.response;

      if (res?.data instanceof Blob && res.data.type === 'application/json') {
        try {
          const text = await res.data.text();
          res.data = JSON.parse(text);
        } catch (_) {}
      }
      const { status, data } = res ?? {};
      let refreshInterval: any;

      if (status.toString().startsWith('5')) {
        return fetch('/api/_health/').catch(() => {
          //TODO: реализовать систему нотификаций handleNotify
          /*   handleNotify({
            open: true,
            type: 'error',
            customMessage: 'Сервер сейчас недоступен. Сохраните свои данные!',
            timeout: 0,
          }); */

          refreshInterval = setInterval(() => {
            fetch('/api/_health/').then(() => {
              return clearInterval(refreshInterval);
            });
          }, 5000);
        });
      }
      switch (status) {
        case 401:
          if (
            !validateRouteCheck(window.location.hash) &&
            window.location.pathname !== '/signin' &&
            window.location.pathname !== '/signin/' &&
            window.location.pathname !== '/signup' &&
            !window.location.pathname.includes('/f/')
          ) {
            window.location.href = '/signin';
          }
          break;
        case 404:
          if (data?.code === 9001) {
            return Promise.reject(error);
          }
          if (
            data?.code &&
            NOT_FOUND_ERROR_CODES.includes(data?.code) &&
            !allowedNotFoundServices(error.config.url)
          ) {
            window.location.href = '/not-found';
          }
          return Promise.reject(error);
        case 409:
        default:
        //TODO: реализовать систему нотификаций handleNotify
        /*  handleNotify({
            open: true,
            type: 'error',
            customMessage: data?.code ? data.ru_error : data.error,
          }); */
      }
      return Promise.reject(error);
    },
  );

  // Если нужны request interceptor'ы, можно добавить их аналогичным образом
  return instance;
}
