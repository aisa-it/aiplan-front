import { storeToRefs } from 'pinia';
import { useProjectStore } from 'src/stores/project-store';
import { useSprintStore } from 'src/modules/sprints/stores/sprint-store';
import {
  TypesIssuesListFilters,
  TypesViewProps,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { useRoute } from 'vue-router';
import { IQuery, useIssuesStore } from 'src/stores/issues-store';
import {
  NEW_GROUP_BY_OPTIONS,
  SPRINT_GROUP_BY_OPTIONS,
} from 'src/constants/constants';
import { API_WORKSPACES_PREFIX } from 'src/constants/apiPrefix';
import { ref } from 'vue';

// НЕ ПЕРЕНОСИТЬ В useIssueContext! Нужно чтобы экземпляр был именно один
// иначе невозможно будет отменить текущий запрос
let activeStreamController: AbortController | null = null;
const isEndStream = ref(true);

async function streamIssuesByEndpoint({
  endpoint,
  filters,
  pagination,
  onChunk,
  options,
}: any) {
  // По умолчанию отменяем предыдущий запрос.
  // Для тех запросов, где это не нужно, отмену отключаем через cancelPrevious: false
  const cancelPrevious = options?.cancelPrevious ?? true;

  const controller = new AbortController();
  if (cancelPrevious) {
    if (activeStreamController) {
      activeStreamController.abort();
    }
    activeStreamController = controller;
  }

  const search = new URLSearchParams();
  for (const [key, value] of Object.entries({ ...pagination, stream: true })) {
    if (value == null || value === '') continue;
    search.set(key, String(value));
  }

  try {
    isEndStream.value = false;
    const response = await fetch(`${endpoint}?${search.toString()}`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/x-ndjson, application/json',
      },
      body: JSON.stringify(filters),
      signal: controller.signal,
    });

    if (!response.ok) {
      // Парсим JSON-ошибку бэка ({code, error, ru_error}) и пробрасываем её
      // наверх — иначе 4xx молча превращается в пустой список.
      let data: { code?: number; error?: string; ru_error?: string } | null =
        null;
      try {
        data = await response.json();
      } catch {}
      const err: any = new Error(
        data?.ru_error || data?.error || `HTTP ${response.status}`,
      );
      err.code = data?.code;
      err.data = data;
      throw err;
    }

    if (!response?.body) return;

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    const flush = (line: string) => {
      const s = line.trim();
      if (!s) return;
      onChunk(JSON.parse(s));
    };

    while (true) {
      const { done, value } = await reader.read();
      isEndStream.value = done;
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';
      lines.forEach(flush);
    }
    flush(buffer);
  } catch (e) {
    // Прерывание предыдущего запроса — штатная ситуация, не ошибка.
    if ((e as Error)?.name === 'AbortError') {
      return;
    }
    throw e;
  } finally {
    isEndStream.value = true;
    if (activeStreamController === controller) {
      activeStreamController = null;
    }
  }
}

export function useIssueContext(contextType: 'project' | 'sprint') {
  const issuesStore = useIssuesStore();
  const route = useRoute();

  if (!route.params.workspace) return;

  if (contextType === 'project') {
    const store = useProjectStore();
    const {
      projectProps,
      isGroupingEnabled,
      isKanbanEnabled,
      isGanttDiagramm,
      issuesLoader,
    } = storeToRefs(store);

    const updateProps = async (props: TypesViewProps) => {
      const { showSubIssues, ...newProps } = props;
      await store.setProjectProps(
        route.params.workspace as string,
        route.params.project as string,
        newProps,
      );

      await store.getMeInProject(
        route.params.workspace as string,
        route.params.project as string,
      );

      projectProps.value.hideSubIssues =
        projectProps.value.hideSubIssues ?? false;
    };

    const getIssue = async (
      filters: TypesIssuesListFilters,
      pagination: IQuery,
      signal?: AbortSignal,
    ) => {
      const response = await issuesStore.getIssuesTable(
        route.params.workspace as string,
        route.params.project as string,
        filters,
        pagination,
        signal,
      );
      return response;
    };

    const getIssueStream = async (
      filters: TypesIssuesListFilters,
      pagination: IQuery,
      onChunk: (chunk: any) => void,
      options?: any,
    ) => {
      const workspaceSlug = route.params.workspace;
      const projectSlug = route.params.project;

      return streamIssuesByEndpoint({
        endpoint: `${API_WORKSPACES_PREFIX}/${workspaceSlug}/projects/${projectSlug}/issues/search`,
        filters,
        pagination,
        onChunk,
        options,
      });
    };

    return {
      contextProps: projectProps,
      isGroupingEnabled,
      getTableColumns: store.getTableColumns,
      GROUP_BY_OPTIONS: NEW_GROUP_BY_OPTIONS,
      isKanbanEnabled,
      isGanttDiagramm,
      issuesLoader,
      isEndStream,
      store,
      updateProps,
      getIssue,
      getIssueStream,
      isGroupHide: store.isGroupHide,
      setGroupHide: store.setGroupHide,
    };
  } else {
    //contextType === 'sprint'
    const store = useSprintStore();
    const {
      sprintProps,
      isGroupingEnabled,
      isKanbanEnabled,
      isGanttDiagramm,
      issuesLoader,
    } = storeToRefs(store);

    const updateProps = async (props?: TypesViewProps) => {
      if (props) {
        const { showSubIssues, ...newProps } = props;
        await store.setMyViewProps(
          route.params.workspace as string,
          route.params.sprint as string,
          newProps,
        );
      }

      await store.getMyViewProps(
        route.params.workspace as string,
        route.params.sprint as string,
      );

      sprintProps.value.issueView = sprintProps.value.issueView || 'list';
      sprintProps.value.hideSubIssues =
        sprintProps.value.hideSubIssues ?? false;
    };

    const getIssue = async (
      filters: TypesIssuesListFilters,
      pagination: IQuery,
      signal?: AbortSignal,
    ) => {
      const response = await store.getIssueList(
        route.params.workspace as string,
        route.params.sprint as string,
        filters,
        pagination,
        signal,
      );
      return response;
    };

    const getIssueStream = async (
      filters: TypesIssuesListFilters,
      pagination: IQuery,
      onChunk: (chunk: any) => void,
      options?: any,
    ) => {
      const workspaceSlug = route.params.workspace;
      const sprintSlug = route.params.sprint;

      return streamIssuesByEndpoint({
        endpoint: `${API_WORKSPACES_PREFIX}/${workspaceSlug}/sprints/${sprintSlug}/issues/search/`,
        filters,
        pagination,
        onChunk,
        options,
      });
    };

    const setGroupHide = (groupToHide: string, hideValue: boolean) => {
      const props = JSON.parse(JSON.stringify(sprintProps.value));

      if (!props.group_tables_hide) props.group_tables_hide = {};

      props.group_tables_hide[groupToHide] = !hideValue;

      updateProps(props);
    };

    return {
      contextProps: sprintProps,
      isGroupingEnabled,
      getTableColumns: store.getTableColumns,
      GROUP_BY_OPTIONS: SPRINT_GROUP_BY_OPTIONS,
      isKanbanEnabled,
      isGanttDiagramm,
      issuesLoader,
      isEndStream,
      store,
      updateProps,
      getIssue,
      getIssueStream,
      isGroupHide: store.isGroupHide,
      setGroupHide: setGroupHide,
    };
  }
}
