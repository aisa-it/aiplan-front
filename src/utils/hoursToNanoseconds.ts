export function hoursToNanoseconds(hours: number): number {
  if (hours < 0 || !isFinite(hours)) {
    throw new Error('Некорректное значение часов');
  }
  const nanoseconds = hours * 3_600_000_000_000;
  if (nanoseconds > Number.MAX_SAFE_INTEGER) {
    console.warn('Результат выходит за пределы безопасного целого числа!');
  }
  return Math.round(nanoseconds);
}

export function nanosecondsToHours(nanoseconds: number): number {
  if (nanoseconds < 0 || !isFinite(nanoseconds)) {
    throw new Error('Некорректное значение наносекунд');
  }
  return nanoseconds / 3_600_000_000_000;
}
