import { isCancel } from 'axios';
import type { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import { NON_VALIDATED_ROUTES } from '@/constants/constants';
import { NOT_FOUND_ERROR_CODES } from '@/constants/notFoundErrorCodes';
import { allowedNotFoundServices } from '@/utils/validation';
import { parseToastMessage, toast } from '@/modules/toast/toast';
import { startServerHealthMonitor } from './server-health-monitor';

type ApiErrorData = {
  code?: unknown;
  error?: unknown;
  ru_error?: unknown;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const getApiErrorData = (value: unknown): ApiErrorData =>
  isRecord(value) ? value : {};

const getApiErrorCode = (data: ApiErrorData) =>
  typeof data.code === 'number' ? data.code : undefined;

const getApiErrorMessage = (data: ApiErrorData) =>
  parseToastMessage(
    getApiErrorCode(data) !== undefined
      ? data.ru_error
      : (data.error ?? data.ru_error),
  );

const isHandledLocally = (error: AxiosError, data: ApiErrorData) => {
  const code = getApiErrorCode(data);

  return (
    code !== undefined && error.config?.localErrorCodes?.includes(code) === true
  );
};

const showApiError = (data: ApiErrorData) => {
  toast.error(getApiErrorMessage(data));
};

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
    async (error: AxiosError) => {
      const res = error.response;

      if (res?.data instanceof Blob && res.data.type === 'application/json') {
        try {
          const text = await res.data.text();
          res.data = JSON.parse(text);
        } catch (_) {
          // TODO: добавить обработку ошибок, не оставлять пустой catch
        }
      }
      const status = res?.status;
      const data = getApiErrorData(res?.data);

      if (isCancel(error) || error?.code === 'ERR_CANCELED') {
        return Promise.reject(error);
      }

      if (!res) {
        toast.error();
        startServerHealthMonitor();
        return Promise.reject(error);
      }

      if (status !== undefined && status >= 500) {
        showApiError(data);
        startServerHealthMonitor();
        return Promise.reject(error);
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
        case 404: {
          const code = getApiErrorCode(data);

          if (code === 9001) {
            return Promise.reject(error);
          }

          if (
            code !== undefined &&
            NOT_FOUND_ERROR_CODES.includes(code) &&
            !allowedNotFoundServices(error.config?.url ?? '')
          ) {
            window.location.href = '/not-found';
            return Promise.reject(error);
          }

          if (!isHandledLocally(error, data)) showApiError(data);
          return Promise.reject(error);
        }
        default:
          if (!isHandledLocally(error, data)) showApiError(data);
      }
      return Promise.reject(error);
    },
  );

  // Если нужны request interceptor'ы, можно добавить их аналогичным образом
  return instance;
}
