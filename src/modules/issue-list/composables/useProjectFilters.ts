// src/composables/useProjectFilters.ts
import { is } from 'quasar';
import { computed, ref, watch, onMounted, toRaw, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';

import { useProjectStore } from 'src/stores/project-store';
import { useIssuesStore } from 'src/stores/issues-store';

import { DEFAULT_VIEW_PROPS } from 'src/modules/issue-list/constants/defaultProps';
import {
  GROUP_BY_OPTIONS,
  NEW_GROUP_BY_OPTIONS,
} from 'src/constants/constants';

export function useProjectFilters() {
  const route = useRoute();
  const projectStore = useProjectStore();
  const { projectProps, issuesLoader, getStatusesAsArray } =
    storeToRefs(projectStore);

  const { refreshIssues } = storeToRefs(useIssuesStore());

  const viewForm = ref(DEFAULT_VIEW_PROPS);
  const optionsGroup = ref(NEW_GROUP_BY_OPTIONS);

  const isShowIndicators = computed(() => {
    let isShow = false;
    const isNoGroupNone =
      projectProps?.value?.filters?.group_by !== GROUP_BY_OPTIONS[0].value;
    const isNotHideSubIssues = projectProps?.value?.hideSubIssues;
    const isShowOnlyActive = projectProps?.value?.showOnlyActive;
    const isStatusLength = !!projectProps.value?.filters?.states?.length;

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
        // приводим поле columns_to_show к формату string[], иногда туда залетает объект
        viewForm.value.columns_to_show = raw.columns_to_show.map(
          (column) => column?.name || column,
        );
      }

      const props = JSON.parse(JSON.stringify(raw));

      const { showSubIssues, ...newProps } = props;

      await projectStore.setProjectProps(
        route.params.workspace as string,
        route.params.project as string,
        newProps,
      );

      await projectStore.getMeInProject(
        route.params.workspace as string,
        route.params.project as string,
      );

      projectProps.value.hideSubIssues =
        projectProps.value.hideSubIssues ?? false;

      viewForm.value = JSON.parse(JSON.stringify(projectProps.value));
      await nextTick();
      refreshIssues.value = true;
    } finally {
      issuesLoader.value = false;
    }
  };

  const refreshFilters = async () => {
    viewForm.value = DEFAULT_VIEW_PROPS;
    await onUpdate();
  };

  const setOptionsGroupForKanban = () => {
    // если выбран канбан, то убираем возможность выбрать "Нет" в группировке
    if (viewForm.value.issueView === 'kanban') {
      optionsGroup.value = optionsGroup.value.filter(
        (opt) => opt.value !== 'none',
      );

      if (viewForm.value.filters?.group_by === 'none') {
        viewForm.value.filters.group_by = optionsGroup.value[0].value;
      }
    } else {
      optionsGroup.value = NEW_GROUP_BY_OPTIONS;
    }
  };

  onMounted(() => {
    setOptionsGroupForKanban();
  });

  const updateIssueView = async () => {
    // разворачиваем объект, тк нужно только значение value
    viewForm.value.issueView =
      viewForm.value.issueView?.value ?? viewForm.value.issueView;

    // подменяем в сторе чтобы корректно отобразиоть скелетон
    projectProps.value.issueView = viewForm.value.issueView;

    setOptionsGroupForKanban();

    await onUpdate();
  };

  // для обновления формы пропсов
  watch(
    () => projectProps.value,
    () => {
      if (is.object(projectProps.value)) {
        viewForm.value = JSON.parse(JSON.stringify(projectProps.value));

        if (viewForm.value.issueView === 'kanban') {
          optionsGroup.value = optionsGroup.value.filter(
            (opt) => opt.value !== 'none',
          );
        } else {
          optionsGroup.value = NEW_GROUP_BY_OPTIONS;
        }
      }
    },
    { immediate: true, deep: true },
  );

  const toggles = computed(() => [
    {
      label: 'Скрыть подзадачи',
      model: 'hideSubIssues',
      dataTour: 'task-general-settings',
    },
    {
      label: 'Показывать черновики',
      model: 'draft',
      dataTour: 'task-general-settings',
    },
    {
      label: 'Показывать пустые группы',
      notShow: projectProps.value?.filters?.group_by === 'none',
      model: 'showEmptyGroups',
      dataTour: 'task-general-settings',
    },
    {
      label: 'Только активные',
      model: 'showOnlyActive',
      dataTour: 'task-personal-settings',
    },
  ]);

  const filtersToggles = computed(() => [
    {
      label: 'Я исполнитель',
      model: 'assignedToMe',
      dataTour: 'task-personal-settings',
    },
    {
      label: 'Я наблюдатель',
      model: 'watchedToMe',
      dataTour: 'task-personal-settings',
    },
    {
      label: 'Я автор',
      model: 'authoredToMe',
      dataTour: 'task-personal-settings',
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
