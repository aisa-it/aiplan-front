// src/composables/useProjectFilters.ts
import { is } from 'quasar';
import { computed, ref, watch, onMounted, toRaw, nextTick } from 'vue';
import { storeToRefs } from 'pinia';

import { useSprintStore } from 'src/modules/sprints/stores/sprint-store';

import { DEFAULT_VIEW_PROPS } from 'src/modules/issue-list/constants/defaultProps';
import { SPRINT_GROUP_BY_OPTIONS } from 'src/constants/constants';
import { useRoute } from 'vue-router';

export function useSprintFilters(emits?) {
  const route = useRoute();
  const sprintStore = useSprintStore();
  const { sprintProps, issuesLoader, getStatusesAsArray } =
    storeToRefs(sprintStore);

  const viewForm = ref(DEFAULT_VIEW_PROPS);
  const optionsGroup = ref(SPRINT_GROUP_BY_OPTIONS);

  const isShowIndicators = computed(() => {
    let isShow = false;
    const isNoGroupNone =
      sprintProps?.value?.filters?.group_by !==
      SPRINT_GROUP_BY_OPTIONS[0].value;
    const isNotHideSubIssues = sprintProps?.value?.hideSubIssues;
    const isShowOnlyActive = sprintProps?.value?.showOnlyActive;
    const isStatusLength = !!sprintProps.value?.filters?.states?.length;

    if (
      isNotHideSubIssues ||
      isShowOnlyActive ||
      isNoGroupNone ||
      isStatusLength
    ) {
      isShow = true;
    }
    return isShow;
  });

  const onUpdate = async () => {
    try {
      issuesLoader.value = true;

      const raw = toRaw(viewForm.value);

      if (viewForm.value.columns_to_show) {
        viewForm.value.columns_to_show = raw.columns_to_show.map(
          (column) => column?.name || column,
        );
      }

      const props = JSON.parse(JSON.stringify(raw));

      const { showSubIssues, ...newProps } = props;

      await sprintStore.setMyViewProps(
        route.params.workspace as string,
        route.params.sprint as string,
        newProps,
      );

      await sprintStore.getMyViewProps(
        route.params.workspace as string,
        route.params.sprint as string,
      );

      sprintProps.value.issueView = sprintProps.value.issueView || 'list';

      sprintProps.value.hideSubIssues =
        sprintProps.value.hideSubIssues ?? false;

      viewForm.value = JSON.parse(JSON.stringify(sprintProps.value));

      emits?.('update', sprintProps.value?.filters?.group_by);
    } finally {
      issuesLoader.value = false;
    }
  };

  const refreshFilters = async () => {
    viewForm.value = DEFAULT_VIEW_PROPS;
    await onUpdate();
  };

  const setOptionsGroupForKanban = () => {
    if (viewForm.value.issueView === 'kanban') {
      optionsGroup.value = optionsGroup.value.filter(
        (opt) => opt.value !== 'none',
      );

      if (viewForm.value.filters?.group_by === 'none') {
        viewForm.value.filters.group_by = optionsGroup.value[0].value;
      }
    } else {
      optionsGroup.value = SPRINT_GROUP_BY_OPTIONS;
    }
  };

  onMounted(() => {
    setOptionsGroupForKanban();
  });

  const updateIssueView = async () => {
    viewForm.value.issueView =
      viewForm.value.issueView?.value ?? viewForm.value.issueView;

    sprintProps.value.issueView = viewForm.value.issueView;

    setOptionsGroupForKanban();

    await onUpdate();
  };

  watch(
    () => sprintProps.value,
    () => {
      if (is.object(sprintProps.value)) {
        viewForm.value = JSON.parse(JSON.stringify(sprintProps.value));
        if (viewForm.value.issueView === 'kanban') {
          optionsGroup.value = optionsGroup.value.filter(
            (opt) => opt.value !== 'none',
          );
        } else {
          optionsGroup.value = SPRINT_GROUP_BY_OPTIONS;
        }
      }
    },
    { immediate: true, deep: true },
  );

  const toggles = computed(() => [
    {
      label: 'Скрыть подзадачи',
      model: 'hideSubIssues',
    },
    {
      label: 'Показывать черновики',
      model: 'draft',
    },
    {
      label: 'Показывать пустые группы',
      notShow: sprintProps.value?.filters?.group_by === 'none',
      model: 'showEmptyGroups',
    },
    {
      label: 'Только активные',
      model: 'showOnlyActive',
    },
  ]);

  const filtersToggles = computed(() => [
    {
      label: 'Я исполнитель',
      model: 'assignedToMe',
    },
    {
      label: 'Я наблюдатель',
      model: 'watchedToMe',
    },
    {
      label: 'Я автор',
      model: 'authoredToMe',
    },
  ]);

  return {
    viewForm,
    optionsGroup,
    isShowIndicators,
    toggles,
    filtersToggles,
    getStatusesAsArray,
    onUpdate,
    refreshFilters,
    updateIssueView,
  };
}
