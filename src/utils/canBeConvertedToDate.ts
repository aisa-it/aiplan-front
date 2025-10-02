// Проверка на возможную дату в строке
export function canBeConvertedToDate(str: string): boolean {
  const date = new Date(str);
  return !isNaN(date.getTime());
}
