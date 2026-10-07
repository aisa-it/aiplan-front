// Подгонка произвольного цвета (не из нашей палитры) под тему оформления.
// Цвет из вставки извне рассчитан на светлый фон источника; в тёмной теме
// тёмный текст и светлый фон сливаются. Оттенок сохраняем, отражаем светлоту.

type Rgb = { r: number; g: number; b: number; alpha?: string };

const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));

export const parseCssColor = (value: string): Rgb | null => {
  const v = value.trim();

  const hex = v.match(/^#([0-9a-f]{3,8})$/i)?.[1];
  if (hex) {
    if (hex.length === 3 || hex.length === 4) {
      const [r, g, b, a] = hex.split('').map((c) => parseInt(c + c, 16));
      return {
        r,
        g,
        b,
        alpha: a !== undefined ? a.toString(16).padStart(2, '0') : undefined,
      };
    }
    if (hex.length === 6 || hex.length === 8) {
      return {
        r: parseInt(hex.slice(0, 2), 16),
        g: parseInt(hex.slice(2, 4), 16),
        b: parseInt(hex.slice(4, 6), 16),
        alpha: hex.length === 8 ? hex.slice(6, 8) : undefined,
      };
    }
    return null;
  }

  const rgb = v.match(
    /^rgba?\(\s*(\d{1,3})\s*[, ]\s*(\d{1,3})\s*[, ]\s*(\d{1,3})\s*(?:[,/]\s*([\d.]+%?)\s*)?\)$/i,
  );
  if (rgb) {
    let alpha: string | undefined;
    if (rgb[4] !== undefined) {
      const a = rgb[4].endsWith('%')
        ? parseFloat(rgb[4]) / 100
        : parseFloat(rgb[4]);
      alpha = clamp(a * 255)
        .toString(16)
        .padStart(2, '0');
    }
    return { r: clamp(+rgb[1]), g: clamp(+rgb[2]), b: clamp(+rgb[3]), alpha };
  }

  return null;
};

export const toHex = ({ r, g, b, alpha }: Rgb): string =>
  '#' +
  [r, g, b].map((c) => clamp(c).toString(16).padStart(2, '0')).join('') +
  (alpha ?? '');

const rgbToHsl = ({ r, g, b }: Rgb) => {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === rn) h = (gn - bn) / d + (gn < bn ? 6 : 0);
  else if (max === gn) h = (bn - rn) / d + 2;
  else h = (rn - gn) / d + 4;
  return { h: h / 6, s, l };
};

const hslToRgb = (h: number, s: number, l: number): Rgb => {
  if (s === 0) {
    const v = l * 255;
    return { r: v, g: v, b: v };
  }
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return {
    r: hue2rgb(p, q, h + 1 / 3) * 255,
    g: hue2rgb(p, q, h) * 255,
    b: hue2rgb(p, q, h - 1 / 3) * 255,
  };
};

// Светлота, с которой текст ещё читается на любом фоне, не трогаем:
// цвета в середине диапазона читаемы в обеих темах, а отражение
// l → 1 − l обратимо, так что сохранённый из тёмной темы цвет
// в светлой вернётся к исходному.
const TEXT_DARK_LIMIT = 0.4;
const BG_LIGHT_LIMIT = 0.6;

export const adaptColorToTheme = (
  value: string,
  theme: 'light' | 'dark',
  isBackground: boolean,
): string | null => {
  const rgb = parseCssColor(value);
  if (!rgb) return null;

  const { h, s, l } = rgbToHsl(rgb);

  let flip: boolean;
  if (isBackground) {
    flip = theme === 'dark' ? l > BG_LIGHT_LIMIT : l < 1 - BG_LIGHT_LIMIT;
  } else {
    flip = theme === 'dark' ? l < TEXT_DARK_LIMIT : l > 1 - TEXT_DARK_LIMIT;
  }
  if (!flip) return null;

  return toHex({ ...hslToRgb(h, s, 1 - l), alpha: rgb.alpha });
};
