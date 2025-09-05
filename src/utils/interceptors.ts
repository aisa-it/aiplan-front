import { AxiosInstance, AxiosResponse } from 'axios';
import { useNotificationStore } from 'src/stores/notification-store';
import { NON_VALIDATED_ROUTES } from 'src/constants/constants';
import { NOT_FOUND_ERROR_CODES } from 'src/constants/notFoundErrorCodes';
import { useAiplanStore } from 'src/stores/aiplan-store';
import { allowedNotFoundServices } from 'src/utils/validation';

const toast = useNotificationStore();
const appStore = useAiplanStore();

const validateRouteCheck = (route: string): boolean =>
  NON_VALIDATED_ROUTES.includes(route);

/**
 * Применяет interceptor'ы к переданному экземпляру Axios
 */
export function applyInterceptors(instance: AxiosInstance): AxiosInstance {
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
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
      if (
        appStore.isServerUnavailable === false &&
        status.toString().startsWith('5')
      ) {
        appStore.isServerUnavailable = true;
        return appStore.api.get('/api/_health/').catch(() => {
          toast.setNotificationView({
            open: true,
            type: 'error',
            customMessage: 'Сервер сейчас недоступен. Сохраните свои данные!',
            timeout: 0,
          });

          refreshInterval = setInterval(() => {
            appStore.api.get('/api/_health/').then(() => {
              appStore.isServerUnavailable = false;
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
        default:
          toast.setNotificationView({
            open: true,
            type: 'error',
            customMessage: data?.code ? data.ru_error : data.error,
          });
      }
      return Promise.reject(error);
    },
  );

  // Если нужны request interceptor'ы, можно добавить их аналогичным образом
  return instance;
}
