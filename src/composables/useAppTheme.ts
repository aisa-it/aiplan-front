import { computed } from 'vue';
import { useTheme } from 'vuetify';

export function useAppTheme() {
  const theme = useTheme();

  const isDark = computed(() => theme.global.name.value === 'dark');

  function toggleTheme() {
    theme.change(isDark.value ? 'light' : 'dark');

    document.documentElement.classList.toggle('dark', isDark.value);
  }

  return {
    isDark,
    toggleTheme,
  };
}
