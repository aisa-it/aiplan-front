import type { DtoUser } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { i18n } from '@/i18n';

export function getUrlFile(id = '', url = '/api/auth/file/'): string {
  if (!id) return '';

  return url + id;
}

export function getUserName(
  user: DtoUser,
  isShowBlockStatus: boolean = true,
): string {
  let fullName = `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim();

  if (isShowBlockStatus && !user.is_active) {
    fullName += ` (${i18n.global.t('common.states.blocked')})`;
  }

  return fullName;
}

export function getFirstSymbol(value = '', isUpperCase = true) {
  if (!value) return '';

  if (typeof value !== 'string') {
    console.error('Ожидается строка, а передается ' + typeof value);
    return '';
  }

  if (!isUpperCase) return value.trim()[0].toLowerCase();

  return value.trim()[0].toUpperCase();
}

export function getRandomEmoji(emojis: Array<string>) {
  const randomEmojiIndex = Math.floor(Math.random() * emojis.length);
  return emojis[randomEmojiIndex];
}
