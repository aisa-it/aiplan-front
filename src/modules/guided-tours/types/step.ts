export interface Step {
  el: string;
  title: string;
  text: string;
  position?: 'top' | 'right' | 'bottom' | 'left' | 'center';
  activeButtonText?: string;
  is_skip?: boolean;
  padding?: number;
}
