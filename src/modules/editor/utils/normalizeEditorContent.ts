import {
  EDITOR_HIGHLIGHT_COLORS,
  EDITOR_TEXT_COLORS,
} from '../constants/editor.constants';
import type { EditorColorOption } from '../model/editor.types';

type EditorThemeName = 'light' | 'dark';

interface ParsedColor {
  hex: string;
  alpha?: string;
}

const componentToHex = (value: number) =>
  Math.round(value).toString(16).padStart(2, '0').toUpperCase();

const parseColor = (value: string): ParsedColor | undefined => {
  if (value.startsWith('#')) {
    return {
      hex: value.slice(0, 7).toUpperCase(),
      alpha: value.length === 9 ? value.slice(7, 9).toUpperCase() : undefined,
    };
  }

  const components = value.match(/[\d.]+/g)?.map(Number);
  if (!components || components.length < 3) return undefined;

  const [red, green, blue, alpha] = components;
  return {
    hex: `#${componentToHex(red)}${componentToHex(green)}${componentToHex(blue)}`,
    alpha: alpha === undefined ? undefined : componentToHex(alpha * 255),
  };
};

const findColor = (value: string, colors: EditorColorOption[]) => {
  const normalized = value.toUpperCase();
  return colors.find(
    (color) =>
      color.light.toUpperCase() === normalized ||
      color.dark.toUpperCase() === normalized,
  );
};

export const normalizeEditorContent = (
  content: string,
  theme: EditorThemeName,
) => {
  const legacyContent = content.replaceAll('\t', '&nbsp;&nbsp;&nbsp;&nbsp;');
  const template = document.createElement('template');
  template.innerHTML = legacyContent;
  let changed = false;

  for (const element of template.content.querySelectorAll<HTMLElement>(
    '[style], [data-color], [data-icon-color]',
  )) {
    for (const property of ['color', 'background-color'] as const) {
      const value = element.style.getPropertyValue(property);
      const parsed = parseColor(value);
      if (!parsed) continue;
      const palette =
        property === 'color' ? EDITOR_TEXT_COLORS : EDITOR_HIGHLIGHT_COLORS;
      const color = findColor(parsed.hex, palette);
      if (!color || color[theme].toUpperCase() === parsed.hex) continue;
      element.style.setProperty(
        property,
        `${color[theme]}${parsed.alpha ?? ''}`,
        element.style.getPropertyPriority(property),
      );
      changed = true;
    }
    for (const attribute of ['data-color', 'data-icon-color'] as const) {
      const value = element.getAttribute(attribute);
      if (!value) continue;
      const palette =
        attribute === 'data-color'
          ? EDITOR_HIGHLIGHT_COLORS
          : EDITOR_TEXT_COLORS;
      const color = findColor(value, palette);
      if (!color || color[theme].toUpperCase() === value.toUpperCase())
        continue;
      element.setAttribute(attribute, color[theme]);
      changed = true;
    }
  }
  return changed ? template.innerHTML : legacyContent;
};
