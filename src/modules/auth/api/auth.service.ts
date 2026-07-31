import { Users } from '@aisa-it/aiplan-api-ts/src/Users';
import { withInterceptors } from '@/utils/interceptorsWithInstanceClass';
export const authApi = new (withInterceptors(Users))();

export const AuthService = {
  async login(email: string, password?: string, captchaPayload?: string) {
    const res = await authApi.emailLogin({
      email,
      password,
      captcha_payload: captchaPayload || '',
    });
    return res;
  },

  async registerViaEmail(email: string, captchaPayload?: string) {
    await authApi.signUp({
      email,
      captcha_payload: captchaPayload || '',
    });
  },

  async forgotPassword(email: string, captchaPayload?: string) {
    try {
      await authApi.forgotPassword({
        email,
        captcha_payload: captchaPayload || '',
      });
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  },

  async signOut() {
    try {
      await authApi.signOut();
    } catch (e) {
      console.error(e);
    }
  },

  async signOutEverywhere() {
    try {
      await authApi.signOutEverywhere();
    } catch (e) {
      console.error(e);
    }
  },
};
