// Типы дополнительных параметров: единый словарь для модалки шаблона
// (CustomPropertyEditModal) и списка шаблонов (CustomPropertyItem)
export const PROPERTY_TYPE_OPTIONS = [
  { label: 'Строка', value: 'string' },
  { label: 'Флаг', value: 'boolean' },
  { label: 'Список', value: 'select' },
  { label: 'Ссылка', value: 'link' },
  { label: 'Справочник', value: 'lookup' },
  { label: 'Дата', value: 'date' },
  { label: 'Дата и время', value: 'datetime' },
];

export const PROPERTY_TYPE_LABELS: Record<string, string> = Object.fromEntries(
  PROPERTY_TYPE_OPTIONS.map((opt) => [opt.value, opt.label]),
);
