export interface UserCredentials {
  email: string;
  password?: string;
  captchaPayload?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  loading: boolean;
  authError: boolean;
  isEnabledCaptcha: boolean;
  ny: boolean;
}
