import { defineStore } from 'pinia';

const HISTORY_KEY = 'aiplan-aql-history';
const HISTORY_LIMIT = 50;

// мусор в хранилище (не массив, битый JSON) даёт пустую историю
const readHistory = (): string[] => {
  try {
    const saved = JSON.parse(localStorage.getItem(HISTORY_KEY) ?? '[]');
    if (!Array.isArray(saved)) return [];
    return saved
      .filter((item): item is string => typeof item === 'string')
      .slice(0, HISTORY_LIMIT);
  } catch {
    return [];
  }
};

export const useAqlStore = defineStore('aql-store', {
  state: () => ({
    // свежие запросы сверху
    history: readHistory(),
    // запрос из ссылки /s/?aql=...; null — ссылки не было
    queryFromRoute: null as string | null,
  }),
  actions: {
    addToHistory(query: string) {
      const trimmed = query.trim();
      if (!trimmed) return;

      this.history = [
        trimmed,
        ...this.history.filter((item) => item !== trimmed),
      ].slice(0, HISTORY_LIMIT);

      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(this.history));
      } catch {
        // хранилище недоступно или переполнено: история живёт до перезагрузки
      }
    },
    clearHistory() {
      this.history = [];
      try {
        localStorage.removeItem(HISTORY_KEY);
      } catch {
        // хранилище недоступно: история и так жила только до перезагрузки
      }
    },
    setQueryFromRoute(query: string | null) {
      this.queryFromRoute = query;
    },
  },
});
