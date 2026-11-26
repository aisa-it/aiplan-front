// Токенизатор AQL для подсветки. Повторяет лексер грамматики AQL.g4:
// выигрывает самое длинное совпадение, при равной длине — правило, объявленное раньше.

export type AqlTokenType =
  | 'keyword'
  | 'operator'
  | 'string'
  | 'number'
  | 'duration'
  | 'function'
  | 'word'
  | 'punct'
  | 'space'
  | 'other';

export interface AqlToken {
  type: AqlTokenType;
  text: string;
  // индексы UTF-16, [start, end)
  start: number;
  end: number;
}

const KEYWORDS = new Set([
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

// Двухсимвольные идут раньше односимвольных.
const SYMBOLS: [string, AqlTokenType][] = [
  ['!=', 'operator'],
  ['!~', 'operator'],
  ['<=', 'operator'],
  ['>=', 'operator'],
  ['&&', 'keyword'],
  ['||', 'keyword'],
  ['=', 'operator'],
  ['~', 'operator'],
  ['<', 'operator'],
  ['>', 'operator'],
  ['!', 'keyword'],
  ['&', 'keyword'],
  ['|', 'keyword'],
  ['(', 'punct'],
  [')', 'punct'],
  ['[', 'punct'],
  [']', 'punct'],
  [',', 'punct'],
];

const WS = /[ \t\r\n\f\u00A0]+/y;

// Строка в кавычках; незакрытая тянется до конца строки.
const QUOTED = /"(?:\\[^\r\n]|[^"\\\r\n])*"?|'(?:\\[^\r\n]|[^'\\\r\n])*'?/y;

const NUMBER = /[+-]?[0-9]+/y;

const DUR_PART = '[0-9]+(?:\\.[0-9]+)?(?:мес|нед|мин|[ywdhmгндчм])';
const DURATION = new RegExp(`[+-]?${DUR_PART}(?:[ \\t]*${DUR_PART})*`, 'iy');

// Строка без кавычек.
const STRING = /(?:\\[^\r\n]|[^ \t\r\n\f\u00A0"'\\=!<>~(),[\]{}|&])+/y;

function matchLength(re: RegExp, input: string, pos: number): number {
  re.lastIndex = pos;
  const match = re.exec(input);
  return match ? match[0].length : 0;
}

// Токены покрывают весь ввод без пропусков и наложений.
export function tokenizeAql(input: string): AqlToken[] {
  const tokens: AqlToken[] = [];
  let pos = 0;

  const push = (type: AqlTokenType, length: number) => {
    const end = pos + length;
    tokens.push({ type, text: input.slice(pos, end), start: pos, end });
    pos = end;
  };

  while (pos < input.length) {
    const space = matchLength(WS, input, pos);
    if (space > 0) {
      push('space', space);
      continue;
    }

    const char = input[pos];
    if (char === '"' || char === "'") {
      push('string', matchLength(QUOTED, input, pos));
      continue;
    }

    const symbol = SYMBOLS.find(([text]) => input.startsWith(text, pos));
    if (symbol) {
      push(symbol[1], symbol[0].length);
      continue;
    }

    const word = matchLength(STRING, input, pos);
    if (word === 0) {
      push('other', 1);
      continue;
    }

    const number = matchLength(NUMBER, input, pos);
    const duration = matchLength(DURATION, input, pos);
    if (number >= duration && number >= word) {
      push('number', number);
    } else if (duration >= word) {
      push('duration', duration);
    } else {
      const text = input.slice(pos, pos + word).toLowerCase();
      push(KEYWORDS.has(text) ? 'keyword' : 'word', word);
    }
  }

  // Функция — слово, за которым идёт открывающая скобка (пробелы между ними допустимы).
  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i].type !== 'word') continue;
    let next = i + 1;
    while (tokens[next]?.type === 'space') next++;
    if (tokens[next]?.text === '(') tokens[i].type = 'function';
  }

  return tokens;
}
