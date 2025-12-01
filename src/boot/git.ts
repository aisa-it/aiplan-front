import { boot } from 'quasar/wrappers';
import { useGitStore } from 'src/stores/git-store';

/**
 * Boot файл для инициализации Git store
 *
 * Загружает конфигурацию Git сервера при старте приложения,
 * что позволяет определить доступность Git функционала
 * и отобразить соответствующую иконку в UI
 *
 * @see src/stores/git-store.ts
 * @see src/components/menu/NavMenuHeader.vue
 */
export default boot(async () => {
  const gitStore = useGitStore();

  // Загружаем Git конфигурацию асинхронно
  // Не блокируем старт приложения - загрузка происходит в фоне
  try {
    await gitStore.fetchGitConfig();
  } catch (error) {
    // Ошибки уже обрабатываются в store, просто логируем
    console.error('[Boot:Git] Failed to initialize Git store:', error);
  }
});
