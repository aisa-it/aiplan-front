// Чистка оформления при вставке извне (Jira, Word, браузер): цвет, шрифт,
// фон и отступы источника в документ не переносим — они рассчитаны на его
// тему и ломаются у нас. Семантику (жирный, курсив, размер, выравнивание)
// оставляем: обработчик вставки читает её из style и переводит в свои марки.

const KEEP_STYLE_PROPS = new Set([
  'font-size',
  'font-weight',
  'font-style',
  'text-decoration',
  'text-decoration-line',
  'text-align',
]);

// Атрибуты-оформление из старого HTML (<font color>, <td bgcolor>).
const DROP_ATTRS = ['color', 'face', 'bgcolor', 'background'];

// ProseMirror ставит маркер на HTML, скопированный из любого своего редактора:
// там цвета уже из нашей палитры, чистить нечего.
export const isFromProseMirror = (html: string) =>
  html.includes('data-pm-slice');

const filterStyle = (style: string): string =>
  style
    .split(';')
    .map((decl) => decl.trim())
    .filter((decl) => {
      const prop = decl.split(':')[0]?.trim().toLowerCase();
      return prop && KEEP_STYLE_PROPS.has(prop);
    })
    .join('; ');

export const stripPastedStyles = (fragment: DocumentFragment) => {
  for (const el of fragment.querySelectorAll<HTMLElement>('[style]')) {
    const kept = filterStyle(el.getAttribute('style') ?? '');
    if (kept) el.setAttribute('style', kept);
    else el.removeAttribute('style');
  }

  for (const attr of DROP_ATTRS) {
    for (const el of fragment.querySelectorAll(`[${attr}]`)) {
      el.removeAttribute(attr);
    }
  }
};
