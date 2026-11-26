// Автодополнение AQL: по токенам до каретки определяет, что ждёт запрос
// (поле, оператор, значение, связку), и собирает варианты. Полный разбор
// грамматики не нужен — хватает автомата по условиям и ORDER BY.

import { tokenizeAql, type AqlToken } from './tokenize';
import {
  AQL_DATE_FUNCTIONS,
  AQL_FIELDS,
  AQL_ISSUE_FUNCTIONS,
  AQL_USER_FUNCTIONS,
  findAqlField,
  type AqlField,
  type AqlFunction,
  type AqlValueSource,
} from './fields';

export interface AqlSuggestUser {
  avatarId?: string | null;
  initials: string;
}

export interface AqlSuggestItem {
  label: string;
  // текст, который встанет в запрос
  insert: string;
  hint?: string;
  // на сколько символов от конца вставки отступить каретке
  caretBack?: number;
  user?: AqlSuggestUser;
  // по чему ещё искать, кроме label (логин, почта)
  search?: string[];
}

// Значение из списка с бэка: в запрос попадает через valueItem
export interface AqlSuggestValue {
  label: string;
  value: string;
  hint?: string;
  user?: AqlSuggestUser;
  search?: string[];
}

export type AqlSuggestSource = AqlValueSource | 'users';

export interface AqlSuggestContext {
  // заменяемый участок запроса, индексы UTF-16
  from: number;
  to: number;
  // набранное начало, по нему отбираются варианты
  prefix: string;
  items: AqlSuggestItem[];
  // список, который надо дозагрузить и добавить к items
  source?: AqlSuggestSource;
  // что дописать после значения из списка
  valueSuffix: string;
  // строка под списком
  footer?: string;
}

type State =
  | 'field'
  | 'operator'
  | 'afterNot'
  | 'afterIs'
  | 'afterIsNot'
  | 'value'
  | 'inValue'
  | 'listValue'
  | 'listSep'
  | 'afterClause'
  | 'afterOrder'
  | 'sortField'
  | 'sortDir'
  | 'sortSep'
  | 'none';

const KEYWORD_SYMBOLS: Record<string, string> = {
  '&&': 'and',
  '&': 'and',
  '||': 'or',
  '|': 'or',
  '!': 'not',
};

const keywordOf = (token: AqlToken) => {
  if (token.type !== 'keyword') return '';
  const lower = token.text.toLowerCase();
  return KEYWORD_SYMBOLS[lower] ?? lower;
};

const isValueToken = (token: AqlToken) =>
  token.type === 'word' ||
  token.type === 'string' ||
  token.type === 'number' ||
  token.type === 'duration';

// Содержимое строки в кавычках; закрывающей кавычки может ещё не быть
const unquote = (text: string) => {
  const quote = text[0];
  if (quote !== '"' && quote !== "'") return text;
  const closed = text.length > 1 && text.endsWith(quote);
  return text
    .slice(1, closed ? -1 : undefined)
    .replace(/\\(.)/g, (_, char) => char);
};

// Без кавычек значение пишется, только если лексер прочтёт его одним словом
const BARE_VALUE = /^[\p{L}_][\p{L}\p{N}_.@+\-/:#*?]*$/u;
const RESERVED = new Set([
  'and',
  'or',
  'not',
  'in',
  'is',
  'empty',
  'null',
  'order',
  'by',
  'asc',
  'desc',
  'was',
  'changed',
  'after',
  'before',
  'on',
  'during',
  'from',
  'to',
]);

export function quoteAqlValue(value: string): string {
  if (BARE_VALUE.test(value) && !RESERVED.has(value.toLowerCase())) {
    return value;
  }
  return `"${value.replace(/[\\"]/g, '\\$&')}"`;
}

export const valueItem = (
  value: AqlSuggestValue,
  suffix: string,
): AqlSuggestItem => ({
  label: value.label,
  insert: quoteAqlValue(value.value) + suffix,
  hint: value.hint,
  user: value.user,
  search: value.search,
});

const keyword = (text: string, hint?: string): AqlSuggestItem => ({
  label: text,
  insert: `${text} `,
  hint,
});

const functionItem = (fn: AqlFunction, suffix: string): AqlSuggestItem => ({
  label: fn.code,
  // каретка встаёт внутрь кавычек — пробел после скобки там лишний
  insert: fn.caretBack ? fn.code : fn.code + suffix,
  hint: fn.text,
  caretBack: fn.caretBack,
});

const fieldItems = (fields: AqlField[], suffix: string): AqlSuggestItem[] =>
  fields.map((field) => ({
    label: field.name,
    insert: field.name + suffix,
    hint: field.text,
  }));

const EMPTY_OPERATORS = [
  keyword('IS EMPTY', 'не заполнено'),
  keyword('IS NOT EMPTY', 'заполнено'),
];
const IN_OPERATORS: AqlSuggestItem[] = [
  { label: 'IN', insert: 'IN (', hint: 'одно из списка' },
  { label: 'NOT IN', insert: 'NOT IN (', hint: 'ни одно из списка' },
];
const EQUAL_OPERATORS = [keyword('=', 'равно'), keyword('!=', 'не равно')];
const ORDER_OPERATORS = [
  keyword('<', 'раньше'),
  keyword('<=', 'не позже'),
  keyword('>', 'позже'),
  keyword('>=', 'не раньше'),
];
const TEXT_OPERATORS = [
  keyword('~', 'содержит слова'),
  keyword('!~', 'не содержит'),
];

function operatorItems(field: AqlField | null): AqlSuggestItem[] {
  // параметр задачи: тип неизвестен, годится любой оператор
  if (!field) {
    return [
      ...EQUAL_OPERATORS,
      ...TEXT_OPERATORS,
      ...ORDER_OPERATORS,
      ...IN_OPERATORS,
      ...EMPTY_OPERATORS,
    ];
  }

  const items: AqlSuggestItem[] = [];
  if (field.kind === 'ref' || field.kind === 'user' || field.kind === 'issue') {
    items.push(...EQUAL_OPERATORS, ...IN_OPERATORS);
  } else if (field.kind === 'date') {
    items.push(...EQUAL_OPERATORS, ...ORDER_OPERATORS);
  } else if (field.kind === 'text') {
    items.push(...TEXT_OPERATORS);
  }
  if (field.empty) items.push(...EMPTY_OPERATORS);
  return items;
}

const USERS_FOOTER = '@ — выбрать пользователя';

interface ValueSuggest {
  items: AqlSuggestItem[];
  source?: AqlSuggestSource;
  footer?: string;
}

function valueItems(
  field: AqlField | null,
  operator: string,
  suffix: string,
): ValueSuggest {
  if (!field || operator === '~' || operator === '!~') return { items: [] };

  if (field.kind === 'user') {
    return {
      items: AQL_USER_FUNCTIONS.map((fn) => functionItem(fn, suffix)),
      footer: USERS_FOOTER,
    };
  }
  if (field.kind === 'date') {
    return {
      items: AQL_DATE_FUNCTIONS.map((fn) => functionItem(fn, suffix)),
    };
  }
  if (field.values) {
    return {
      items: field.values.map((value) =>
        valueItem({ label: value, value }, suffix),
      ),
    };
  }
  return { items: [], source: field.source };
}

// Индекс закрывающей скобки вызова функции, стоящей в tokens[index]; -1 — вызов не закрыт
function skipCall(tokens: AqlToken[], index: number): number {
  let depth = 0;
  for (let i = index + 1; i < tokens.length; i++) {
    if (tokens[i].text === '(') depth++;
    else if (tokens[i].text === ')' && --depth === 0) return i;
  }
  return -1;
}

interface Position {
  state: State;
  field: string;
  operator: string;
}

function walk(tokens: AqlToken[]): Position {
  let state: State = 'field';
  let field = '';
  let operator = '';

  for (let i = 0; i < tokens.length && state !== 'none'; i++) {
    const token = tokens[i];
    const kw = keywordOf(token);
    const isEmpty = kw === 'empty' || kw === 'null';

    // вызов функции целиком считается одним значением
    const call = () => {
      i = skipCall(tokens, i);
      return i >= 0;
    };

    switch (state) {
      case 'field':
        if (kw === 'not' || token.text === '(') break;
        if (kw === 'order') state = 'afterOrder';
        else if (token.type === 'word' || token.type === 'string') {
          field = unquote(token.text);
          state = 'operator';
        } else state = 'none';
        break;

      case 'operator':
        if (token.text === '[') {
          // cf[10010]: номер поля в скобках
          while (i < tokens.length && tokens[i].text !== ']') i++;
        } else if (token.type === 'operator') {
          operator = token.text;
          state = 'value';
        } else if (kw === 'in') {
          operator = 'in';
          state = 'inValue';
        } else if (kw === 'not') state = 'afterNot';
        else if (kw === 'is') state = 'afterIs';
        else state = 'none';
        break;

      case 'afterNot':
        operator = 'in';
        state = kw === 'in' ? 'inValue' : 'none';
        break;

      case 'afterIs':
        if (kw === 'not') state = 'afterIsNot';
        else state = isEmpty ? 'afterClause' : 'none';
        break;

      case 'afterIsNot':
        state = isEmpty ? 'afterClause' : 'none';
        break;

      case 'value':
        if (token.type === 'function') state = call() ? 'afterClause' : 'none';
        else state = isValueToken(token) || isEmpty ? 'afterClause' : 'none';
        break;

      case 'inValue':
        if (token.text === '(') state = 'listValue';
        else if (token.type === 'function') {
          state = call() ? 'afterClause' : 'none';
        } else state = 'none';
        break;

      case 'listValue':
        if (token.type === 'function') state = call() ? 'listSep' : 'none';
        else state = isValueToken(token) || isEmpty ? 'listSep' : 'none';
        break;

      case 'listSep':
        if (token.text === ',') state = 'listValue';
        else state = token.text === ')' ? 'afterClause' : 'none';
        break;

      case 'afterClause':
        if (kw === 'and' || kw === 'or') state = 'field';
        else if (kw === 'order') state = 'afterOrder';
        else if (token.text !== ')') state = 'none';
        break;

      case 'afterOrder':
        state = kw === 'by' ? 'sortField' : 'none';
        break;

      case 'sortField':
        state =
          token.type === 'word' || token.type === 'string' ? 'sortDir' : 'none';
        break;

      case 'sortDir':
        if (kw === 'asc' || kw === 'desc') state = 'sortSep';
        else state = token.text === ',' ? 'sortField' : 'none';
        break;

      case 'sortSep':
        state = token.text === ',' ? 'sortField' : 'none';
        break;
    }
  }

  return { state, field, operator };
}

const PARTIAL_TYPES = new Set([
  'word',
  'keyword',
  'function',
  'string',
  'number',
  'duration',
]);

// Что предложить в позиции caret; null — предлагать нечего
export function getAqlSuggest(
  text: string,
  caret: number,
): AqlSuggestContext | null {
  const tokens = tokenizeAql(text);

  // слово под кареткой заменяется целиком, варианты отбираются по его началу
  const current = tokens.find(
    (token) =>
      token.start < caret &&
      caret <= token.end &&
      PARTIAL_TYPES.has(token.type) &&
      // связки-символы (&&, !) словом не считаются
      !(
        token.type === 'keyword' && token.text.toLowerCase() in KEYWORD_SYMBOLS
      ),
  );
  const from = current ? current.start : caret;
  const to = current ? current.end : caret;
  const typed = current ? text.slice(current.start, caret) : '';

  const before = tokens.filter(
    (token) => token.end <= from && token.type !== 'space',
  );
  const { state, field: fieldName, operator } = walk(before);
  const field = findAqlField(fieldName);

  const base = { from, to, prefix: typed, valueSuffix: '' };
  const done = (
    items: AqlSuggestItem[],
    extra: Partial<AqlSuggestContext> = {},
  ): AqlSuggestContext | null =>
    items.length || extra.source ? { ...base, items, ...extra } : null;

  switch (state) {
    case 'field':
      return done(
        fieldItems(
          AQL_FIELDS.filter((item) => !item.sortOnly),
          ' ',
        ),
      );

    case 'operator':
      return done(operatorItems(field));

    case 'afterNot':
      return done([{ label: 'IN', insert: 'IN (' }]);

    case 'afterIs':
      return done([keyword('EMPTY'), keyword('NOT EMPTY')]);

    case 'afterIsNot':
      return done([keyword('EMPTY')]);

    case 'value':
    case 'listValue': {
      // в списке после значения пишут запятую или скобку, пробел там лишний
      const suffix = state === 'value' ? ' ' : '';

      // @ — пользователи, как упоминание в комментарии
      if (typed.startsWith('@')) {
        return {
          ...base,
          prefix: typed.slice(1),
          items: [],
          source: 'users',
          valueSuffix: suffix,
        };
      }

      const values = valueItems(field, operator, suffix);
      return done(values.items, {
        prefix: current?.type === 'string' ? unquote(typed) : typed,
        source: values.source,
        valueSuffix: suffix,
        footer: values.footer,
      });
    }

    case 'inValue':
      return done(
        field?.kind === 'issue'
          ? AQL_ISSUE_FUNCTIONS.map((fn) => functionItem(fn, ' '))
          : [],
      );

    case 'afterClause':
      return done([
        keyword('AND', 'и'),
        keyword('OR', 'или'),
        keyword('ORDER BY', 'сортировка'),
      ]);

    case 'afterOrder':
      return done([keyword('BY')]);

    case 'sortField':
      return done(
        fieldItems(
          AQL_FIELDS.filter((item) => item.sort),
          '',
        ),
      );

    case 'sortDir':
      return done([
        { label: 'ASC', insert: 'ASC', hint: 'по возрастанию' },
        { label: 'DESC', insert: 'DESC', hint: 'по убыванию' },
      ]);

    default:
      return null;
  }
}

const MAX_ITEMS = 50;

// Отбор по набранному началу: сначала совпавшие с начала, потом по вхождению
export function filterAqlSuggest(
  items: AqlSuggestItem[],
  prefix: string,
): AqlSuggestItem[] {
  const needle = prefix.trim().toLowerCase();
  if (!needle) return items.slice(0, MAX_ITEMS);

  const starts: AqlSuggestItem[] = [];
  const contains: AqlSuggestItem[] = [];
  for (const item of items) {
    const texts = [item.label, ...(item.search ?? [])].map((value) =>
      value.toLowerCase(),
    );
    if (texts.some((value) => value.startsWith(needle))) starts.push(item);
    else if (texts.some((value) => value.includes(needle))) contains.push(item);
  }

  const found = [...starts, ...contains].slice(0, MAX_ITEMS);
  // единственный вариант уже набран целиком — дополнять нечего
  if (found.length === 1 && found[0].insert.trim().toLowerCase() === needle) {
    return [];
  }
  return found;
}
