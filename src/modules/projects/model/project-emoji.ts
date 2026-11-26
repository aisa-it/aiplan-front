export function formatProjectEmoji(value?: string) {
  if (!value) return '';
  const code = Number.parseInt(value, 10);
  return Number.isFinite(code) && code > 0 && code <= 0x10ffff
    ? String.fromCodePoint(code)
    : value;
}
