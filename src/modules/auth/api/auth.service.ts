import { usersApi } from '@/services/clients';

export const AuthService = {
  async login(email: string, password?: string, captchaPayload?: string) {
    const res = await usersApi.emailLogin({
      email,
      password,
      captcha_payload: captchaPayload || '',
    });
    return res.data;
  },

  async registerViaEmail(email: string, captchaPayload?: string) {
    await usersApi.signUp({
      email,
      captcha_payload: captchaPayload || '',
    });
  },

  async forgotPassword(email: string, captchaPayload?: string) {
    try {
      await usersApi.forgotPassword({
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
      await usersApi.signOut();
    } catch (e) {
      console.error(e);
    }
  },

  async signOutEverywhere() {
    try {
      await usersApi.signOutEverywhere();
    } catch (e) {
      console.error(e);
    }
  },
};
