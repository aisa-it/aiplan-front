// JQL-расширения, которых ещё нет в опубликованном пакете @aisa-it/aiplan-api-ts:
// бэкенд хранит JQL-запрос в поисковых фильтрах (поле jql).
declare module '@aisa-it/aiplan-api-ts/src/data-contracts' {
  interface DtoSearchFilterLight {
    jql?: string | null;
  }
  interface DtoSearchFilterFull {
    jql?: string | null;
  }
}

export {};
