import { isEmail } from '@/utils/validation';
import { i18n } from '@/i18n';

type Rule = (value: string) => true | string;

type NameFieldKey = 'firstName' | 'lastName';

const required =
  (field: 'firstName' | 'lastName' | 'username' | 'password'): Rule =>
  (value) =>
    Boolean(value?.trim()) ||
    i18n.global.t(`profile.validation.required.${field}`);

const maxLength =
  (length: number): Rule =>
  (value) =>
    value.length <= length ||
    i18n.global.t('profile.validation.maxLength', { length });

const nameCharacters =
  (field: NameFieldKey): Rule =>
  (value) =>
    /^[а-яёА-ЯЁ-]+$|^[a-zA-Z-]+$/.test(value) ||
    i18n.global.t(`profile.validation.nameCharacters.${field}`);

const containsLetter =
  (field: NameFieldKey): Rule =>
  (value) =>
    /[а-яёА-ЯЁa-zA-Z]/.test(value) ||
    i18n.global.t(`profile.validation.containsLetter.${field}`);

const usernameCharacters: Rule = (value) =>
  /^[A-Za-z0-9._/\\-]+$/.test(value) ||
  i18n.global.t('profile.validation.usernameCharacters');

const usernameContainsLetter: Rule = (value) =>
  /[A-Za-z]/.test(value) ||
  i18n.global.t('profile.validation.usernameContainsLetter');

const telegramId: Rule = (value) =>
  !value ||
  /^\d+$/.test(value) ||
  i18n.global.t('profile.validation.telegramId');

export function useProfileValidationRules() {
  const firstNameRules = [
    required('firstName'),
    maxLength(100),
    nameCharacters('firstName'),
    containsLetter('firstName'),
  ];

  const lastNameRules = [
    required('lastName'),
    maxLength(100),
    nameCharacters('lastName'),
    containsLetter('lastName'),
  ];

  const usernameRules = [
    required('username'),
    maxLength(100),
    usernameCharacters,
    usernameContainsLetter,
  ];

  const emailRules = [
    (value: string) =>
      isEmail(value) || i18n.global.t('profile.validation.email'),
  ];
  const telegramIdRules = [telegramId, maxLength(15)];
  const passwordRules = [required('password')];

  return {
    emailRules,
    firstNameRules,
    lastNameRules,
    passwordRules,
    telegramIdRules,
    usernameRules,
  };
}
