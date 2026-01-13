interface ISelect {
  label: string;
  value?: string | number;
}

interface MenuItem {
  id: string;
  el: HTMLElement;
  minHeight: number;
  open: boolean;
  weight: number;
}

interface MenuLayout {
  weights: Record<string, number>;
  open: Record<string, boolean>;
}

export type { ISelect, MenuItem, MenuLayout };
