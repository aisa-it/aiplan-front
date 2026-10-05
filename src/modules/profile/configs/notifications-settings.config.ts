import type { TypesUserSettings } from '@aisa-it/aiplan-api-ts/src/data-contracts';

export const NOTIFICATION_CHANNELS = [
  { title: 'Email', key: 'email_notification_mute' },
  { title: 'Telegram', key: 'telegram_notification_mute' },
  { title: 'Система', key: 'app_notification_mute' },
] as const satisfies ReadonlyArray<{
  title: string;
  key: keyof TypesUserSettings;
}>;

export const DEADLINE_NOTIFICATION_OPTIONS = [
  { title: 'Никогда', value: 0 },
  { title: '1 час', value: 1 },
  { title: '2 часа', value: 2 },
  { title: '3 часа', value: 3 },
  { title: '4 часа', value: 4 },
  { title: '5 часов', value: 5 },
  { title: '6 часов', value: 6 },
  { title: '1 день', value: 24 },
  { title: '2 дня', value: 48 },
  { title: '3 дня', value: 72 },
] as const;

export const hoursToNanoseconds = (hours: number) =>
  hours * 60 * 60 * 1_000_000_000;

export const nanosecondsToHours = (nanoseconds?: number) =>
  nanoseconds === undefined ? 24 : nanoseconds / 60 / 60 / 1_000_000_000;
