import { normalizeOfficeLists } from './normalizeOfficeLists';

const TEXT_STYLES = [
  'font-size',
  'font-family',
  'font-weight',
  'font-style',
  'color',
  'text-decoration',
] as const;
const KEPT_STYLES = [
  ...TEXT_STYLES,
  'text-align',
  'background-color',
  'width',
  'height',
  'max-width',
  'float',
  'display',
  'margin',
] as const;

const TABLE_CLASS_STYLES = new Set([
  'font-size',
  'font-weight',
  'font-style',
  'text-decoration',
]);
const WORD_DEFAULT_BLACK = new Set([
  'black',
  '#000',
  '#000000',
  'rgb(0, 0, 0)',
]);

type TextStyles = Partial<Record<(typeof TEXT_STYLES)[number], string>>;

const normalizeFontSize = (value: string) => {
  const points = value.match(/^([\d.]+)pt$/i);
  return points ? `${Math.round((Number(points[1]) * 4) / 3)}px` : value;
};

export function normalizePastedHtml(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const isFromWord =
    /<!--[\s]*\[if gte mso 9\]/i.test(html) ||
    /\bclass=["'][^"']*Mso[A-Za-z]/i.test(html) ||
    /<\/?o:p\b/i.test(html);
  normalizeOfficeLists(doc);
  const rules: CSSStyleRule[] = [];

  for (const element of doc.querySelectorAll('style')) {
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(element.textContent ?? '');
    for (const rule of Array.from(sheet.cssRules)) {
      if (rule instanceof CSSStyleRule) rules.push(rule);
    }
  }

  doc
    .querySelectorAll(
      'style, script, link, meta, title, iframe, object, embed, br.Apple-interchange-newline',
    )
    .forEach((element) => element.remove());

  if (/docs-internal-guid/i.test(html)) {
    for (const br of doc.body.querySelectorAll('br')) {
      const paragraph = doc.createElement('p');
      paragraph.innerHTML = '&nbsp;';
      br.replaceWith(paragraph);
    }
  }

  const visit = (element: HTMLElement, inherited: TextStyles = {}) => {
    const inline = element.style.cssText;
    const merged = doc.createElement('span').style;
    const insideTable = !!element.closest('table');
    for (const rule of rules) {
      let matches = false;
      try {
        matches = element.matches(rule.selectorText);
      } catch {}
      if (matches && insideTable) {
        for (const property of KEPT_STYLES) {
          if (!TABLE_CLASS_STYLES.has(property)) continue;
          const value = rule.style.getPropertyValue(property);
          if (value) merged.setProperty(property, value);
        }
      }
    }
    merged.cssText += `;${inline}`;
    if (element.tagName === 'FONT') {
      const size = Number(element.getAttribute('size'));
      const sizes = [0, 8, 10, 12, 14, 18, 24, 36];
      if (!merged.fontSize && sizes[size]) merged.fontSize = `${sizes[size]}pt`;
      if (!merged.fontFamily)
        merged.fontFamily = element.getAttribute('face') ?? '';
      if (!merged.color) merged.color = element.getAttribute('color') ?? '';
    }

    if (merged.color.toLowerCase() === 'windowtext')
      merged.removeProperty('color');

    if (isFromWord && WORD_DEFAULT_BLACK.has(merged.color.toLowerCase()))
      merged.removeProperty('color');
    if (merged.backgroundColor.toLowerCase() === 'window')
      merged.removeProperty('background-color');
    merged.fontSize = normalizeFontSize(merged.fontSize);
    element.removeAttribute('style');
    for (const property of KEPT_STYLES) {
      const value = merged.getPropertyValue(property);
      if (value) element.style.setProperty(property, value);
    }
    for (const attribute of Array.from(element.attributes)) {
      if (/^on/i.test(attribute.name)) element.removeAttribute(attribute.name);
    }

    const textStyles = { ...inherited };
    if (element.matches('b, strong')) textStyles['font-weight'] = 'bold';
    if (element.matches('i, em')) textStyles['font-style'] = 'italic';
    if (element.matches('u')) textStyles['text-decoration'] = 'underline';
    if (element.matches('s, del'))
      textStyles['text-decoration'] = 'line-through';
    for (const property of TEXT_STYLES) {
      const value = merged.getPropertyValue(property);
      if (value) textStyles[property] = value;
    }

    for (const child of Array.from(element.childNodes)) {
      if (child instanceof HTMLElement) {
        visit(child, textStyles);
      } else if (
        child.nodeType === Node.TEXT_NODE &&
        child.textContent?.trim() &&
        Object.keys(textStyles).length &&
        !element.closest('pre, code')
      ) {
        const span = doc.createElement('span');
        for (const [property, value] of Object.entries(textStyles)) {
          span.style.setProperty(property, value);
        }
        child.replaceWith(span);
        span.append(child);
      } else if (child.nodeType === Node.COMMENT_NODE) {
        child.remove();
      }
    }
    if (element.tagName.includes(':') || element.tagName === 'FONT') {
      element.replaceWith(...element.childNodes);
    }
  };

  visit(doc.body);
  return doc.body.innerHTML;
}
