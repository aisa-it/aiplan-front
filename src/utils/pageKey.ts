import type { RouteLocationNormalizedLoaded } from 'vue-router';

// Маршруты АИДока, которые должны делить один инстанс страницы.
const AIDOC_ROUTE_NAMES = ['aidoc', 'doc'];

/**
 * Ключ, по которому router-view пересоздаёт страницу.
 *
 * По умолчанию — путь: смена пути = новая страница. Для АИДока так нельзя:
 * путь содержит id документа, и на каждом переходе уничтожалась вся страница
 * вместе с левым меню (дерево, раскрытые ветки, скролл). Поэтому все маршруты
 * АИДока в пределах пространства делят один ключ, а перезагрузку документа
 * берёт на себя watch на route.params.doc в AiDocPage.
 *
 * Используется во ВСЕХ router-view на пути к странице (MainLayout →
 * WorkspacePage → страница): remount на любом уровне уничтожает поддерево.
 */
export const getPageKey = (route: RouteLocationNormalizedLoaded): string =>
  AIDOC_ROUTE_NAMES.includes(route.name as string)
    ? `aidoc-${route.params.workspace}`
    : route.path;
