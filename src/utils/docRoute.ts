import type { RouteLocationNormalizedLoaded } from 'vue-router';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const isUuid = (value: unknown): value is string =>
  typeof value === 'string' && UUID_RE.test(value);

export interface DocRouteRef {
  /** id документа либо путь из слагов `roditel/dokument` */
  ref: string;
  isId: boolean;
  commentId?: string;
}

/**
 * Сегменты адреса после `/aidoc/`: путь по слагам названий от корня
 * (или id документа — старые ссылки живут), последним может идти
 * id комментария.
 */
export function parseDocSegments(segments: string[]): DocRouteRef | null {
  const parts = segments.filter(Boolean);
  if (!parts.length) return null;

  let commentId: string | undefined;
  if (parts.length > 1 && isUuid(parts[parts.length - 1])) {
    commentId = parts.pop();
  }

  const ref = parts.join('/');
  return { ref, isId: parts.length === 1 && isUuid(ref), commentId };
}

export function parseDocRoute(
  route: RouteLocationNormalizedLoaded,
): DocRouteRef | null {
  const raw = route.params.docPath;
  const segments = Array.isArray(raw)
    ? raw
    : typeof raw === 'string'
      ? raw.split('/')
      : [];
  return parseDocSegments(segments as string[]);
}

export function docRoutePath(
  workspaceSlug: string,
  ref: string,
  commentId?: string,
): string {
  return `/${workspaceSlug}/aidoc/${ref}${commentId ? `/${commentId}` : ''}`;
}
