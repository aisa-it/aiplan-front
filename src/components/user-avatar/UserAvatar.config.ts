export interface DisplayOptions {
  size?: AvatarSize;
  noHat?: boolean;
  rounded?: boolean;
}

export const DEFAULT_OPTIONS: DisplayOptions = {
  size: 'medium',
  noHat: false,
  rounded: true,
} as const;

export const AVATAR_SIZES = {
  small: 24,
  medium: 32,
  large: 40,
  extralarge: 64,
} as const;

export type AvatarSize = keyof typeof AVATAR_SIZES;

export const FALLBACK_TEXT_SIZE = {
  small: 'text-xs',
  medium: 'text-sm',
  large: 'text-base',
  extralarge: 'text-lg',
} as const;
