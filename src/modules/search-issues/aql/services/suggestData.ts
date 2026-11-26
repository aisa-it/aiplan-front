// Списки значений для автодополнения. Каждый список берётся готовой ручкой
// один раз и живёт в памяти: отбор по набранному идёт на фронте, без запросов
// на каждую букву.

import { useUserStore } from 'src/stores/user-store';
import aiplan from 'src/utils/aiplan';
import {
  getFilterLabels,
  getFilterMembers,
  getFilterStates,
} from 'src/modules/search-issues/filter-list/services/api';

import type { AqlSuggestSource, AqlSuggestValue } from '../utils/suggest';

const TTL = 5 * 60 * 1000;

const cache = new Map<
  AqlSuggestSource,
  { at: number; values: Promise<AqlSuggestValue[]> }
>();

// Одинаковые названия из разных проектов в запросе неразличимы
function uniqueByName(names: (string | undefined)[]): AqlSuggestValue[] {
  const seen = new Set<string>();
  const values: AqlSuggestValue[] = [];
  for (const name of names) {
    const key = name?.trim().toLowerCase();
    if (!name || !key || seen.has(key)) continue;
    seen.add(key);
    values.push({ label: name, value: name });
  }
  return values.sort((a, b) => a.label.localeCompare(b.label));
}

async function loadProjects(): Promise<AqlSuggestValue[]> {
  const store = useUserStore();
  const projects = store.userProjects.length
    ? store.userProjects
    : await store.getUserProjects();

  return projects
    .filter((project) => project.identifier)
    .map((project) => ({
      label: project.identifier as string,
      value: project.identifier as string,
      hint: project.name,
      search: [project.name ?? ''],
    }));
}

async function loadWorkspaces(): Promise<AqlSuggestValue[]> {
  return useUserStore()
    .userWorkspaces.filter((workspace) => workspace.slug)
    .map((workspace) => ({
      label: workspace.slug as string,
      value: workspace.slug as string,
      hint: workspace.name,
      search: [workspace.name ?? ''],
    }));
}

async function loadStatuses(): Promise<AqlSuggestValue[]> {
  const { data } = await getFilterStates({});
  return uniqueByName((data.result ?? []).map((state) => state.name));
}

async function loadLabels(): Promise<AqlSuggestValue[]> {
  const { data } = await getFilterLabels({});
  return uniqueByName((data.result ?? []).map((label) => label.name));
}

// В запрос уходит логин, как в упоминании; без логина — почта
async function loadUsers(): Promise<AqlSuggestValue[]> {
  const me = useUserStore().user?.id;
  const { data } = await getFilterMembers({});

  return (data.result ?? [])
    .filter((user) => user.is_active !== false && (user.username || user.email))
    .sort((a, b) => Number(b.id === me) - Number(a.id === me))
    .map((user) => {
      const name = aiplan.UserName(user);
      return {
        label: name.join(' '),
        value: (user.username || user.email) as string,
        hint: user.username || user.email,
        user: {
          avatarId: user.avatar_id,
          initials: name.map((part: string) => part[0]).join(' '),
        },
        search: [user.username ?? '', user.email ?? ''],
      };
    });
}

const LOADERS: Record<AqlSuggestSource, () => Promise<AqlSuggestValue[]>> = {
  project: loadProjects,
  workspace: loadWorkspaces,
  status: loadStatuses,
  labels: loadLabels,
  users: loadUsers,
};

export function loadAqlSuggestValues(
  source: AqlSuggestSource,
): Promise<AqlSuggestValue[]> {
  const cached = cache.get(source);
  if (cached && Date.now() - cached.at < TTL) return cached.values;

  // неудачную загрузку не запоминаем: следующая подсказка попробует снова
  const values = LOADERS[source]().catch(() => {
    cache.delete(source);
    return [];
  });
  cache.set(source, { at: Date.now(), values });
  return values;
}
