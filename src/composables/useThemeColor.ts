import { watchEffect } from 'vue';
import { Dark } from 'quasar';
import { useUserStore } from 'stores/user-store';

// Кеш темы для первого кадра, пока пользователь ещё не загружен
const STORAGE_KEY = 'dark';

function storedDark(): boolean {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'false') === true;
  } catch {
    return false;
  }
}

// Единственная точка применения темы: источник — настройки пользователя,
// до их загрузки — localStorage. Подключается boot-файлом, лейауты тему не трогают.
export function useThemeColor() {
  const userStore = useUserStore();

  watchEffect(() => {
    let isDark: boolean;
    if (userStore.user?.theme) {
      isDark = userStore.getTheme === 'dark';
      localStorage.setItem(STORAGE_KEY, String(isDark));
    } else {
      isDark = storedDark();
    }

    Dark.set(isDark);
    const tag = document.querySelector('meta[name="theme-color"]');
    if (tag) tag.setAttribute('content', isDark ? '#1f2228' : '#3f75ff');
  });
}
