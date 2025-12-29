export interface Step {
  el: string;
  title: string;
  text?: string;
  textList?: string[];
  placement: Placement;
  activeButtonText?: string;
  is_skip?: boolean;
  padding?: number;

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
