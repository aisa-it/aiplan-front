import { defineStore } from 'pinia';
import { useAiplanStore } from './aiplan-store';
import type { GitConfig } from 'src/modules/git/types';

/**
 * Pinia store для управления Git конфигурацией
 *
 * Загружает конфигурацию Git сервера при старте приложения
 * и предоставляет информацию о доступности Git функционала
 */
export const useGitStore = defineStore('git-store', {
  state: () => ({
    /** Включена ли Git интеграция на сервере */
    gitEnabled: false,
    /** Путь к директории с Git репозиториями на сервере */
    gitRepositoriesPath: '',
    /** Флаг успешной загрузки конфигурации */
    configLoaded: false,
    /** Флаг процесса загрузки */
    loading: false,
  }),

  actions: {
    /**
     * Загружает конфигурацию Git с сервера
     *
     * Вызывается автоматически при старте приложения через boot/git.ts
     *
     * @returns Promise<void>
     */
    async fetchGitConfig(): Promise<void> {
      // Избегаем повторной загрузки если уже загружено
      if (this.configLoaded) {
        return;
      }

      this.loading = true;

      try {
        const aiplanStore = useAiplanStore();
        const api = aiplanStore.api;

        const response = await api.get<GitConfig>('/api/auth/git/config/');

        this.gitEnabled = response.data.git_enabled;
        this.gitRepositoriesPath = response.data.git_repositories_path;
        this.configLoaded = true;

        console.log('[GitStore] Git config loaded:', {
          enabled: this.gitEnabled,
          path: this.gitRepositoriesPath,
        });
      } catch (error) {
        console.error('[GitStore] Failed to fetch Git config:', error);

        // При ошибке считаем что Git отключен
        this.gitEnabled = false;
        this.gitRepositoriesPath = '';
        this.configLoaded = true;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Сбрасывает состояние store (для тестов или logout)
     */
    reset(): void {
      this.gitEnabled = false;
      this.gitRepositoriesPath = '';
      this.configLoaded = false;
      this.loading = false;
    },
  },
});
