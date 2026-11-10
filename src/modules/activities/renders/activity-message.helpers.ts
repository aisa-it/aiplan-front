import type {
  ActivityMessage,
  ActivityMessagePart,
} from './activity-renderer.types';

export const createActivityMessage = (
  ...parts: ActivityMessagePart[]
): ActivityMessage => ({ parts });

export const createTextPart = (text: string): ActivityMessagePart => ({
  type: 'text',
  text,
});

export const createExternalLinkPart = (
  href: string | undefined,
  text: string,
  emphasized = true,
): ActivityMessagePart =>
  href
    ? { type: 'external-link', href, text, emphasized }
    : createTextPart(text);
