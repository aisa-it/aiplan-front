export const THEME_OPTIONS = [
  { title: 'Темная', value: 'dark' },
  { title: 'Светлая', value: 'light' },
] as const;

export const ISSUE_OPEN_OPTIONS = [
  { title: 'В новом окне', value: true },
  { title: 'На текущей странице', value: false },
] as const;

export const ISSUE_AUTO_SAVE_OPTIONS = [
  { title: 'Автосохранение включено', value: true },
  { title: 'Автосохранение выключено', value: false },
] as const;

export const SNOW_OPTIONS = [
  { title: 'Вкл', value: 'enable' },
  { title: 'Выкл', value: 'disable' },
] as const;

export const SNOW_DENSITY_OPTIONS = [
  { title: 'Мало', value: 100 },
  { title: 'Средне', value: 170 },
  { title: 'Много', value: 250 },
] as const;

export type ThemeName = (typeof THEME_OPTIONS)[number]['value'];
export type SnowState = (typeof SNOW_OPTIONS)[number]['value'];
