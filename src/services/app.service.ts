import { httpClient } from './clients';

export interface AppVersionInfo {
  version: string;
  demo: boolean;
  sign_up: boolean;
  ny: boolean;
  jitsi: boolean;
  captcha: boolean;
}

export const AppService = {
  async getVersion() {
    return (await httpClient.get<AppVersionInfo>('/api/version/')).data;
  },
};
