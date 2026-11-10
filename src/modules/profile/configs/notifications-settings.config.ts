import type { TypesUserSettings } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import type { MessageKey } from '@/i18n';

export const NOTIFICATION_CHANNELS = [
  {
    labelKey: 'common.fields.email',
    key: 'email_notification_mute',
  },
  {
    labelKey: 'common.fields.telegram',
    key: 'telegram_notification_mute',
  },
  {
    labelKey: 'profile.notifications.channels.app',
    key: 'app_notification_mute',
  },
] as const satisfies ReadonlyArray<{
  labelKey: MessageKey;
  key: keyof TypesUserSettings;
}>;

export const DEADLINE_NOTIFICATION_OPTIONS = [
  0, 1, 2, 3, 4, 5, 6, 24, 48, 72,
] as const;

export const hoursToNanoseconds = (hours: number) =>
  hours * 60 * 60 * 1_000_000_000;

export const nanosecondsToHours = (nanoseconds?: number) =>
  nanoseconds === undefined ? 24 : nanoseconds / 60 / 60 / 1_000_000_000;
