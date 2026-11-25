import { computed, onScopeDispose, ref, shallowRef, watch } from 'vue';
import type {
  DtoSprint,
  DtoStateLight,
  TypesViewProps,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { issueService } from '@/modules/issues/api/issue-service';
import { DEFAULT_PROJECT_ISSUE_VIEW_SETTINGS } from '@/modules/issues/model/issue-list.defaults';
import type { IssueListActions, SprintIssueListScope } from '@/modules/issues/model/issue-list.types';
import { UserService } from '@/services/user.service';
import { useUserStore } from '@/stores/user-store';
import { useWorkspaceStore } from '@/stores/workspace-store';
import { checkPermissionByIssue, defineRole } from '@/utils/permissions';
import { sprintService } from '../api/sprint.service';

const defaults = DEFAULT_PROJECT_ISSUE_VIEW_SETTINGS;

function normalizeSettings(settings?: TypesViewProps): TypesViewProps {
  const { issueView, filters } = settings ?? {};
  return {
    ...defaults,
    ...settings,
    issueView: issueView === 'kanban' || issueView === 'gantt_chart' ? issueView : 'list',
    filters: {
      ...defaults.filters,
      ...filters,
      ...(filters?.order_by === 'project'
        ? { order_by: 'sequence_id', orderDesc: true }
        : {}),
    },
  };
}

export function useSprintDetails(scope: SprintIssueListScope) {
  const userStore = useUserStore();
  const workspaceStore = useWorkspaceStore();
  const sprint = shallowRef<DtoSprint>();
  const viewSettings = shallowRef<TypesViewProps>(defaults);
  const loadFailed = ref(false);
  const states = shallowRef<DtoStateLight[]>([]);
  const roles = shallowRef<Record<string, string>>({});
  let loadController: AbortController | undefined;
  let disposed = false;
  let confirmedSettings = viewSettings.value;
  let settingsVersion = 0;

  const usedStates = computed(() => {
    const result = new Map<string, DtoStateLight>();
    for (const { state_detail } of sprint.value?.issues ?? []) {
      if (state_detail?.id) result.set(state_detail.id, state_detail);
    }
    return result;
  });
  const stateById = computed(() => {
    const result = new Map(usedStates.value);
    for (const state of states.value) {
      if (state.id) result.set(state.id, state);
    }
    return result;
  });
  const statusOptions = computed(() => {
    const options = new Map<string, DtoStateLight & { ids: string[] }>();
    for (const [stateId, state] of usedStates.value) {
      const id = JSON.stringify([state.name, state.color]);
      const option = options.get(id);
      if (option) option.ids.push(stateId);
      else options.set(id, { id, name: state.name, color: state.color, ids: [stateId] });
    }
    return [...options.values()];
  });
  const projectIds = computed(() =>
    [...new Set([...stateById.value.values()].flatMap(({ project }) => project ? [project] : []))]
      .sort()
      .join(','),
  );
  watch(projectIds, async (ids, _, onCleanup) => {
    if (!ids) {
      roles.value = {};
      return;
    }
    const controller = new AbortController();
    onCleanup(() => controller.abort());
    try {
      const memberships = await UserService.getCurrentUserProjectMemberships(ids.split(','), controller.signal);
      if (!controller.signal.aborted) {
        roles.value = Object.fromEntries(memberships.flatMap((membership) =>
          membership.project_id
            ? [[membership.project_id, membership.is_project_lead ? 'lead' : defineRole(membership.role ?? 0)]]
            : [],
        ));
      }
    } catch {}
  });

  async function load() {
    if (disposed) return;
    loadController?.abort();
    const controller = new AbortController();
    loadController = controller;
    loadFailed.value = false;

    void sprintService.getStates(scope, controller.signal).then((result) => {
      if (!controller.signal.aborted) states.value = result;
    }).catch(() => {});

    try {
      const result = await sprintService.get(scope, controller.signal);
      if (controller.signal.aborted) return;
      if (!sprint.value) {
        confirmedSettings = normalizeSettings(result.view_props);
        viewSettings.value = confirmedSettings;
      }
      sprint.value = result;
    } catch {
      if (!controller.signal.aborted && !sprint.value) loadFailed.value = true;
    }
  }

  function refreshProgress() {
    if (disposed) return;
    void load();
    void workspaceStore.getWorkspaceSummary(scope.workspaceSlug).catch(() => {});
  }

  async function saveView(
    patch: TypesViewProps,
    { replace = false, optimistic = true } = {},
  ) {
    const current = viewSettings.value;
    const next = replace ? normalizeSettings(patch) : normalizeSettings({
      ...current,
      ...patch,
      filters: { ...current.filters, ...patch.filters },
      group_tables_hide: { ...current.group_tables_hide, ...patch.group_tables_hide },
    });
    const version = ++settingsVersion;
    if (optimistic) viewSettings.value = next;
    try {
      await sprintService.saveView(scope, next);
      confirmedSettings = next;
      if (!optimistic && version === settingsVersion) viewSettings.value = next;
    } catch (error) {
      if (optimistic && version === settingsVersion) viewSettings.value = confirmedSettings;
      throw error;
    }
  }

  const actions: IssueListActions = {
    canEdit(issue, field) {
      const projectId = issue.project ?? issue.project_detail?.id;
      const userId = userStore.user?.id;
      if (!projectId || !userId) return false;
      const issueRole = issue.author_detail?.id === userId
        ? 'author'
        : issue.assignee_details?.some(({ id }) => id === userId) ? 'assignee' : '';
      return checkPermissionByIssue(
        userStore.workspaceRoleName,
        roles.value[projectId] ?? '',
        issueRole,
        field === 'state' ? 'change-issue-status' : 'change-issue-primary',
      );
    },
    async update(issue, patch) {
      const projectId = issue.project ?? issue.project_detail?.id;
      if (!projectId || !issue.id) throw new Error('Issue and project IDs are required');
      const result = await issueService.update(scope.workspaceSlug, projectId, issue.id, patch);
      if (patch.state !== undefined) refreshProgress();
      return result;
    },
    getAvailableStates(issue) {
      const projectId = issue.project ?? issue.project_detail?.id;
      if (!projectId || !issue.id) return Promise.resolve([]);
      return issueService.getAvailableStates(scope.workspaceSlug, projectId, issue.id);
    },
    updateViewSettings: saveView,
  };

  onScopeDispose(() => {
    disposed = true;
    loadController?.abort();
  });
  void load();

  return { sprint, viewSettings, loadFailed, statusOptions, stateById, load, refreshProgress, saveView, actions };
}
