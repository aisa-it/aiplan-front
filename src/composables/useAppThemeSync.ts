import { onScopeDispose, watch } from 'vue';
import { storeToRefs } from 'pinia';

import { useUserStore } from '@/stores/user-store';

import { useAppTheme } from './useAppTheme';

export function useAppThemeSync() {
  const { user } = storeToRefs(useUserStore());
  const { getStoredTheme, getUserTheme, setTheme } = useAppTheme();
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');

  setTheme(getStoredTheme(), false);

  watch(
    () => user.value?.theme,
    (preferences) => {
      if (preferences) {
        setTheme(getUserTheme(preferences));
      }
    },
    { deep: true },
  );

  const handleSystemThemeChange = () => {
    if (user.value?.theme?.system) {
      setTheme(getUserTheme(user.value.theme));
    }
  };

  systemTheme.addEventListener('change', handleSystemThemeChange);

  onScopeDispose(() => {
    systemTheme.removeEventListener('change', handleSystemThemeChange);
  });
}
