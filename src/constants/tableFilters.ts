export const COLUMN_FILTERS_MAP: { label: string; key: string }[] = [
  { label: 'Название', key: 'name' },
  { label: 'Приоритет', key: 'priority' },
  { label: 'Статус', key: 'state' },
  { label: 'Срок исполнения', key: 'target_date' },
  { label: 'Дата создания', key: 'created_at' },
  { label: 'Последнее изменение', key: 'updated_at' },
  { label: 'Автор', key: 'author' },
  { label: 'Исполнитель', key: 'assignees' },
  { label: 'Теги', key: 'labels' },
  { label: 'Спринт', key: 'sprints' },
];

export const TABLE_PRIORITY_FILTERS = {
  urgent: 'Критический',
  high: 'Высокий',
  medium: 'Средний',
  low: 'Низкий',
  null: 'Нет',
};
