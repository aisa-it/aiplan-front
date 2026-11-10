import 'axios';
import '@aisa-it/aiplan-api-ts/src/http-client';

declare module 'axios' {
  interface AxiosRequestConfig {
    localErrorCodes?: readonly number[];
  }
}

declare module '@aisa-it/aiplan-api-ts/src/http-client' {
  interface FullRequestParams {
    localErrorCodes?: readonly number[];
  }
}
