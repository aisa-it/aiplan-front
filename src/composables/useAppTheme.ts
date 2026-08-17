import { computed } from 'vue';
import { useTheme } from 'vuetify';

import type { TypesTheme } from '@aisa-it/aiplan-api-ts/src/data-contracts';

export type AppThemeName = 'light' | 'dark';

const THEME_STORAGE_KEY = 'dark';

export function useAppTheme() {
  const theme = useTheme();

  const isDark = computed(() => theme.global.name.value === 'dark');

  function getStoredTheme(): AppThemeName {
    return localStorage.getItem(THEME_STORAGE_KEY) === 'true'
      ? 'dark'
      : 'light';
  }

  function getUserTheme(preferences?: TypesTheme): AppThemeName {
    if (preferences?.system) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    }

    return preferences?.dark ? 'dark' : 'light';
  }

  function setTheme(name: AppThemeName, persist = true) {
    theme.change(name);
    document.documentElement.classList.toggle('dark', name === 'dark');

    if (persist) {
      localStorage.setItem(THEME_STORAGE_KEY, String(name === 'dark'));
    }
  }

  return {
    getStoredTheme,
    getUserTheme,
    isDark,
    setTheme,
  };
}
