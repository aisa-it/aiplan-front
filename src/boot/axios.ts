import { boot } from 'quasar/wrappers';
import axios, { AxiosInstance } from 'axios';

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $axios: AxiosInstance;
    $api: AxiosInstance;
  }
}

// Be careful when using SSR for cross-request state pollution
// due to creating a Singleton instance here;
// If any client changes this (global) instance, it might be a
// good idea to move this instance creation inside of the
// "export default () => {}" function below (which runs individually
// for each client)
const getBaseUrl = () => {
  const viteUrl = (import.meta as unknown as { env?: { VITE_API_URL?: string } })
    ?.env?.VITE_API_URL?.replace(/\/+$/, ''); // убираем все слэши в конце URL
  const origin =
    typeof window !== 'undefined' && window.location
      ? window.location.origin
      : undefined;
  return viteUrl ?? origin;
};

const api = axios.create({ baseURL: getBaseUrl() });

export default boot(({ app }) => {
  // for use inside Vue files (Options API) through this.$axios and this.$api

  app.config.globalProperties.$axios = axios;
  // ^ ^ ^ this will allow you to use this.$axios (for Vue Options API form)
  //       so you won't necessarily have to import axios in each vue file

  app.config.globalProperties.$api = api;
  // ^ ^ ^ this will allow you to use this.$api (for Vue Options API form)
  //       so you can easily perform requests against your app's API
});

export { api };
