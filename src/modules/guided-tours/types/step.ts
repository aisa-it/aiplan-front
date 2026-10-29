import type { MessageKey } from '@/i18n';

export type MessageListItemKey = `${MessageKey}[${number}]`;

export interface Step {
  el: string;
  titleKey: MessageKey;
  textKey?: MessageKey;
  textListKeys?: MessageListItemKey[];
  placement: Placement;
  activeButtonTextKey?: MessageKey;
  is_skip?: boolean;
  padding?: number;
  isOffScroll?: boolean;

  onEnter?: () => void;
  onLeave?: () => void;
}

type Placement = {
  mode?: 'outside' | 'inside' | 'screen';

  primary?: 'top' | 'right' | 'bottom' | 'left' | 'center';
  align?: 'start' | 'center' | 'end';

  offset?: {
    x?: number;
    y?: number;
  };
};
