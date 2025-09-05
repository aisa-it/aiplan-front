export const NAV_ITEMS = [
  {
    slug: 'workspaces',
    label: 'Пространства',
    add_active: ['projects', 'workspace-settings'],
  },
  { slug: 'users', label: 'Пользователи', add_active: ['user-settings'] },
  { slug: 'feedbacks', label: 'Отзывы' },
  { slug: 'release-notes', label: 'Версии' },
  { slug: 'active-imports', label: 'Активные импорты' },
  { slug: 'create-notification', label: 'Создать уведомление' },
  { slug: 'activities', label: 'Активность' },
];

export const BASE_PATH = '/admin-panel';
export const INIT_SLUG = 'workspaces';
