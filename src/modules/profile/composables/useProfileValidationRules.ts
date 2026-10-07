import { isEmail } from '@/utils/validation';

type Rule = (value: string) => true | string;

const required =
  (fieldName: string): Rule =>
  (value) =>
    Boolean(value?.trim()) || `Необходимо ввести ${fieldName}`;

const maxLength =
  (length: number): Rule =>
  (value) =>
    value.length <= length || `Максимальный размер — ${length} символов`;

const nameCharacters =
  (fieldName: string): Rule =>
  (value) =>
    /^[а-яёА-ЯЁ-]+$|^[a-zA-Z-]+$/.test(value) ||
    `${fieldName} может содержать латинские или кириллические буквы и спец. символ дефис (-)`;

const containsLetter =
  (fieldName: string): Rule =>
  (value) =>
    /[а-яёА-ЯЁa-zA-Z]/.test(value) ||
    `${fieldName} пользователя должно содержать минимум одну букву латинского или кириллического алфавита`;

const usernameCharacters: Rule = (value) =>
  /^[A-Za-z0-9._/\\-]+$/.test(value) ||
  'Имя пользователя может содержать буквы латинского алфавита и спец. символы: точка(.), нижнее подчеркивание(_), дефис (-), слэш прямой и обратный (/, \\), цифры (0-9)';

const usernameContainsLetter: Rule = (value) =>
  /[A-Za-z]/.test(value) ||
  'Имя пользователя должно содержать минимум одну букву латинского алфавита';

const telegramId: Rule = (value) =>
  !value || /^\d+$/.test(value) || 'Telegram ID может содержать только цифры';

export function useProfileValidationRules() {
  const firstNameRules = [
    required('имя'),
    maxLength(100),
    nameCharacters('Имя'),
    containsLetter('Имя'),
  ];

  const lastNameRules = [
    required('фамилию'),
    maxLength(100),
    nameCharacters('Фамилия'),
    containsLetter('Фамилия'),
  ];

  const usernameRules = [
    required('имя пользователя'),
    maxLength(100),
    usernameCharacters,
    usernameContainsLetter,
  ];

  const emailRules = [(value: string) => isEmail(value)];
  const telegramIdRules = [telegramId, maxLength(15)];
  const passwordRules = [required('пароль')];

  return {
    emailRules,
    firstNameRules,
    lastNameRules,
    passwordRules,
    telegramIdRules,
    usernameRules,
  };
}
