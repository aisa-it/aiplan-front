import { tokenizeAql } from './tokenize';

type AqlToken = ReturnType<typeof tokenizeAql>[number];

// Столбец таблицы задач → поле сортировки AQL
const SORT_FIELDS: Record<string, string> = {
  sequence_id: 'issue',
  name: 'title',
  priority: 'priority',
  state: 'status',
  target_date: 'duedate',
  created_at: 'created',
  updated_at: 'updated',
  author: 'author',
  assignees: 'assignee',
  watchers: 'watcher',
  labels: 'labels',
};

// Поле сортировки AQL → столбец; имя столбца — тоже допустимое имя поля
const SORT_COLUMNS: Record<string, string> = {};
for (const [column, field] of Object.entries(SORT_FIELDS)) {
  SORT_COLUMNS[field] = column;
  SORT_COLUMNS[column] = column;
}

const isKeyword = (token: AqlToken | undefined, word: string) =>
  token?.type === 'keyword' && token.text.toLowerCase() === word;

// Хвост ORDER BY: где начинается и что идёт после BY (без пробелов).
// Ищется по токенам, чтобы не задеть слово order внутри кавычек.
function findOrderBy(query: string) {
  const tokens = tokenizeAql(query).filter((t) => t.type !== 'space');
  const i = tokens.findIndex(
    (t, n) => isKeyword(t, 'order') && isKeyword(tokens[n + 1], 'by'),
  );
  if (i === -1) return null;
  return { start: tokens[i].start, fields: tokens.slice(i + 2) };
}

// Заменяет ORDER BY в запросе сортировкой по столбцу таблицы;
// column = null — убирает ORDER BY
export function setOrderBy(
  query: string,
  column: string | null,
  desc: boolean,
): string {
  const field = column ? SORT_FIELDS[column] : null;
  if (column && !field) return query;

  const orderBy = findOrderBy(query);
  if (!orderBy && !field) return query;

  const head = (orderBy ? query.slice(0, orderBy.start) : query).trimEnd();
  if (!field) return head;

  const tail = `ORDER BY ${field} ${desc ? 'DESC' : 'ASC'}`;
  return head ? `${head} ${tail}` : tail;
}

// Сортировка запроса, если это ровно одно поле, которому соответствует
// столбец таблицы; иначе null
export function getOrderBy(
  query: string,
): { column: string; desc: boolean } | null {
  const orderBy = findOrderBy(query);
  if (!orderBy || orderBy.fields.length < 1 || orderBy.fields.length > 2)
    return null;

  const [field, direction] = orderBy.fields;
  const desc = isKeyword(direction, 'desc');
  if (direction && !desc && !isKeyword(direction, 'asc')) return null;

  const name = field.text.replace(/^(["'])(.*)\1$/, '$2').toLowerCase();
  const column = SORT_COLUMNS[name];
  return column ? { column, desc } : null;
}
