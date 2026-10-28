import type { MessageKey } from '@/i18n';

export const NON_VALIDATED_ROUTES = [
  '#/',
  '/reset-password',
  '/workspace-member-invitation',
];

// labelKey вместо label: текст подписи живёт в словаре, value уходит в payload бэкенда
export const NETWORK_CHOICES = [
  { value: false, labelKey: 'dialogs.project.visibility.hidden' },
  { value: true, labelKey: 'dialogs.project.visibility.public' },
] as const satisfies ReadonlyArray<{ labelKey: MessageKey; value: boolean }>;

export const PROJECT_IDENTIFIER_LENGTH = {
  MAX: 15,
  MIN: 3,
};

export const RESTRICTED_URLS = [
  'api',
  'create-workspace',
  'error',
  'installations',
  'invitations',
  'magic-sign-in',
  'onboarding',
  'reset-password',
  'signin',
  'signup',
  'workspace-member-invitation',
  '404',
  'undefined',
  'no-workspace',
  'service-unavailable',
  'not-found',
  'admin-panel',
  'profile',
  'conference',
  'mcp',
];
