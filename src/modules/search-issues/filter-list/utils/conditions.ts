import { TypesIssuesListFilters } from '@aisa-it/aiplan-api-ts/src/data-contracts';

// Есть ли у фильтра условия штатного поиска. У фильтра, сохранённого запросом
// AQL, их нет; пустая дата приходит с бэка неположительным числом.
export const hasOldConditions = (filter?: TypesIssuesListFilters | null) =>
  Object.values(filter ?? {}).some((value) => {
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'number') return value > 0;
    return !!value;
  });
