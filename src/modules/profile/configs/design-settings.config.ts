export const THEME_OPTIONS = [
  { labelKey: 'profile.design.theme.options.dark', value: 'dark' },
  { labelKey: 'profile.design.theme.options.light', value: 'light' },
] as const;

export const ISSUE_OPEN_OPTIONS = [
  { labelKey: 'profile.design.issueOpen.options.newWindow', value: true },
  { labelKey: 'profile.design.issueOpen.options.currentPage', value: false },
] as const;

export const ISSUE_AUTO_SAVE_OPTIONS = [
  { labelKey: 'profile.design.autoSave.options.enabled', value: true },
  { labelKey: 'profile.design.autoSave.options.disabled', value: false },
] as const;

export const SNOW_OPTIONS = [
  { labelKey: 'common.states.on', value: 'enable' },
  { labelKey: 'common.states.off', value: 'disable' },
] as const;

export const SNOW_DENSITY_OPTIONS = [
  { labelKey: 'profile.design.snow.density.low', value: 100 },
  { labelKey: 'profile.design.snow.density.medium', value: 170 },
  { labelKey: 'profile.design.snow.density.high', value: 250 },
] as const;

export type ThemeName = (typeof THEME_OPTIONS)[number]['value'];
export type SnowState = (typeof SNOW_OPTIONS)[number]['value'];
