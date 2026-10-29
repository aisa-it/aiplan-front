import type ru from './ru';

export default {
  layout: {
    title: 'Sign in',
  },
  signIn: {
    title: 'Sign in',
    noAccount: "Don't have an account? Sign up",
  },
  signUp: {
    title: 'Sign up',
    hasAccount: 'Already have an account? Sign in',
  },
  login: {
    emailLabel: 'Enter email',
    passwordLabel: 'Enter password',
    passwordPlaceholder: 'Enter password',
    emailRequired: 'Email is required',
    passwordRequired: 'Password is required',
    invalidCredentials: 'Invalid login credentials',
    forgotPassword: 'Forgot your password?',
    signIn: 'Sign in',
    signUp: 'Sign up',
  },
  restore: {
    title: 'Password recovery',
    emailLabel: 'Enter Email',
    emailRequired: 'Enter email',
    submit: 'Restore',
    success: 'Reset link has been sent',
  },
  onboarding: {
    title: 'Please enter your details',
    firstName: 'Enter first name *',
    lastName: 'Enter last name *',
    username: 'Enter username *',
    telegramId: 'Enter Telegram ID',
    telegramHint:
      'Your telegram id for notifications. Write to {bot} to get your id.',
    telegramHintBot: 'the bot',
    usernameExists: 'A user with this name already exists',
  },
  footer: {
    contact: 'Contact us on {telegram} or by {mail}',
    telegram: 'Telegram',
    mail: 'email',
  },
} satisfies typeof ru;
