import { watchEffect } from 'vue';
import { useUserStore } from 'stores/user-store';

export function useThemeColor() {
  const userStore = useUserStore();

  watchEffect(() => {
    const isDark = userStore.user?.theme
      ? userStore.getTheme === 'dark'
      : window.matchMedia('(prefers-color-scheme: dark)').matches;
    const tag = document.querySelector('meta[name="theme-color"]');
    if (tag) tag.setAttribute('content', isDark ? '#1f2228' : '#3f75ff');
  });
}
