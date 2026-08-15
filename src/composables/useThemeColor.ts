import { watchEffect } from 'vue';
import { useUserStore } from 'stores/user-store';

export function useThemeColor() {
  const userStore = useUserStore();

  watchEffect(() => {
    const isDark = userStore.user?.theme
      ? userStore.getTheme === 'dark'
      : window.matchMedia('(prefers-color-scheme: dark)').matches;
    const variant = localStorage.getItem('themeVariant');
    const dataTheme = isDark ? 'dark' : variant === 'light2' ? 'light2' : 'light';

    // атрибут data-theme на body: светлая / темная / светлая 2.0
    document.querySelector('body')?.setAttribute('data-theme', dataTheme);

    const tag = document.querySelector('meta[name="theme-color"]');
    if (tag) tag.setAttribute('content', isDark ? '#1f2228' : '#3f75ff');
  });
}
