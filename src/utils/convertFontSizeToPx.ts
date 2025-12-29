export function convertFontSizeToPx(value: string): string | null {
  const match = value.trim().match(/^([\d.]+)\s*(pt|px)$/i);
  if (!match) return null;

  const num = parseFloat(match[1]);
  const unit = match[2].toLowerCase();

  if (unit === 'px') {
    return `${num}px`;
  } else if (unit === 'pt') {
    return `${Math.round((num * 4) / 3)}px`;
  }
  return null;
}
