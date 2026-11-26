// Поля и функции AQL для автодополнения. Повторяет бэк (pkg/aql: in_queries,
// cmp_queries, empty_queries, order_mapping, functions) — править вместе с ним.

// Откуда брать значения поля: списки приходят с бэка готовыми ручками
export type AqlValueSource = 'project' | 'workspace' | 'status' | 'labels';

// ref — ссылка или значение из списка, issue — задача, empty — только IS EMPTY
export type AqlFieldKind = 'ref' | 'user' | 'issue' | 'date' | 'text' | 'empty';

export interface AqlField {
  name: string;
  text: string;
  kind: AqlFieldKind;
  // закрытый список значений
  values?: string[];
  source?: AqlValueSource;
  // понимает IS EMPTY
  empty?: boolean;
  // по полю можно сортировать
  sort?: boolean;
  // только для ORDER BY, условий по нему нет
  sortOnly?: boolean;
}

export const AQL_FIELDS: AqlField[] = [
  { name: 'project', text: 'проект', kind: 'ref', source: 'project' },
  { name: 'workspace', text: 'пространство', kind: 'ref', source: 'workspace' },
  { name: 'issue', text: 'задача: ключ PRJ-123', kind: 'issue', sort: true },
  { name: 'parent', text: 'родительская задача', kind: 'issue', empty: true },
  {
    name: 'status',
    text: 'статус',
    kind: 'ref',
    source: 'status',
    sort: true,
  },
  {
    name: 'statusGroup',
    text: 'группа статусов',
    kind: 'ref',
    values: ['backlog', 'unstarted', 'started', 'completed', 'cancelled'],
  },
  { name: 'type', text: 'тип задачи', kind: 'ref', empty: true },
  {
    name: 'priority',
    text: 'приоритет',
    kind: 'ref',
    values: ['urgent', 'high', 'medium', 'low'],
    empty: true,
    sort: true,
  },
  {
    name: 'labels',
    text: 'метка',
    kind: 'ref',
    source: 'labels',
    empty: true,
    sort: true,
  },
  { name: 'sprint', text: 'спринт', kind: 'ref', empty: true },
  { name: 'author', text: 'автор', kind: 'user', sort: true },
  {
    name: 'assignee',
    text: 'исполнитель',
    kind: 'user',
    empty: true,
    sort: true,
  },
  {
    name: 'watcher',
    text: 'наблюдатель',
    kind: 'user',
    empty: true,
    sort: true,
  },
  { name: 'links', text: 'связана с задачей', kind: 'issue', empty: true },
  { name: 'blocks', text: 'блокирует задачу', kind: 'issue', empty: true },
  {
    name: 'blockedBy',
    text: 'заблокирована задачей',
    kind: 'issue',
    empty: true,
  },
  { name: 'created', text: 'создана', kind: 'date', sort: true },
  { name: 'updated', text: 'обновлена', kind: 'date', sort: true },
  {
    name: 'completed',
    text: 'завершена',
    kind: 'date',
    empty: true,
    sort: true,
  },
  {
    name: 'startDate',
    text: 'дата начала',
    kind: 'date',
    empty: true,
    sort: true,
  },
  {
    name: 'dueDate',
    text: 'срок исполнения',
    kind: 'date',
    empty: true,
    sort: true,
  },
  { name: 'title', text: 'название', kind: 'text', sort: true },
  { name: 'description', text: 'описание', kind: 'text', empty: true },
  { name: 'comment', text: 'комментарии', kind: 'text' },
  { name: 'text', text: 'название, описание, комментарии', kind: 'text' },
  { name: 'attachments', text: 'вложения', kind: 'empty', empty: true },
  {
    name: 'sub_issues_count',
    text: 'число подзадач',
    kind: 'empty',
    sort: true,
    sortOnly: true,
  },
  {
    name: 'link_count',
    text: 'число ссылок',
    kind: 'empty',
    sort: true,
    sortOnly: true,
  },
  {
    name: 'linked_issues_count',
    text: 'число связанных задач',
    kind: 'empty',
    sort: true,
    sortOnly: true,
  },
  {
    name: 'attachment_count',
    text: 'число вложений',
    kind: 'empty',
    sort: true,
    sortOnly: true,
  },
];

// Другие имена тех же полей: по ним подбираются операторы и значения
const ALIASES: Record<string, string> = {
  reporter: 'author',
  creator: 'author',
  issuetype: 'type',
  due: 'duedate',
  resolved: 'completed',
  resolutiondate: 'completed',
  key: 'issue',
  issuekey: 'issue',
  id: 'issue',
  summary: 'title',
  createddate: 'created',
  updateddate: 'updated',
  statuscategory: 'statusgroup',
  state: 'status',
  assignees: 'assignee',
  watchers: 'watcher',
  name: 'title',
  sequence_id: 'issue',
  created_at: 'created',
  updated_at: 'updated',
  target_date: 'duedate',
};

const BY_NAME = new Map(
  AQL_FIELDS.map((field) => [field.name.toLowerCase(), field]),
);

// Поле по имени из запроса; неизвестное имя — параметр задачи, для него null
export function findAqlField(name: string): AqlField | null {
  const lower = name.toLowerCase();
  return BY_NAME.get(ALIASES[lower] ?? lower) ?? null;
}

export interface AqlFunction {
  // текст вставки
  code: string;
  text: string;
  // на сколько символов от конца вставки поставить каретку (внутрь кавычек)
  caretBack?: number;
}

export const AQL_DATE_FUNCTIONS: AqlFunction[] = [
  { code: 'now()', text: 'текущий момент' },
  { code: 'startOfDay()', text: 'начало дня' },
  { code: 'endOfDay()', text: 'конец дня' },
  { code: 'startOfWeek()', text: 'начало недели' },
  { code: 'endOfWeek()', text: 'конец недели' },
  { code: 'startOfMonth()', text: 'начало месяца' },
  { code: 'endOfMonth()', text: 'конец месяца' },
  { code: 'startOfYear()', text: 'начало года' },
  { code: 'endOfYear()', text: 'конец года' },
];

export const AQL_USER_FUNCTIONS: AqlFunction[] = [
  { code: 'currentUser()', text: 'текущий пользователь' },
];

// Списки задач: только после IN
export const AQL_ISSUE_FUNCTIONS: AqlFunction[] = [
  { code: 'childrenOf("")', text: 'все подзадачи задачи', caretBack: 2 },
  { code: 'linkedTo("")', text: 'связанные с задачей', caretBack: 2 },
];
