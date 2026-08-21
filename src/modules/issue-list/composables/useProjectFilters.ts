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
import { getPropertyTemplates } from 'src/modules/issue-list/services/api';

// значение группировки по дополнительному параметру: property:<uuid шаблона>
const PROPERTY_GROUP_BY_PREFIX = 'property:';

export function useProjectFilters() {
  const route = useRoute();
  const projectStore = useProjectStore();
  const { projectProps, issuesLoader, getStatusesAsArray } =
    storeToRefs(projectStore);

  const { refreshIssues } = storeToRefs(useIssuesStore());

  const viewForm = ref(DEFAULT_VIEW_PROPS);
  // опции группировки по дополнительным параметрам проекта («Параметр: <имя>»)
  const propertyOptions = ref<{ value: string; label: string }[]>([]);

  // единая композиция: стандартные опции + параметры проекта;
  // для канбана недоступна группировка «Нет»
  const optionsGroup = computed(() => {
    const list = [...NEW_GROUP_BY_OPTIONS, ...propertyOptions.value];
    return viewForm.value.issueView === 'kanban'
      ? list.filter((opt) => opt.value !== 'none')
      : list;
  });

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
    if (
      viewForm.value.issueView === 'kanban' &&
      viewForm.value.filters?.group_by === 'none'
    ) {
      viewForm.value.filters.group_by = optionsGroup.value[0].value;
    }
  };

  // загружаем шаблоны дополнительных параметров проекта для группировки
  const loadPropertyOptions = async () => {
    const workspaceSlug = route.params.workspace as string;
    const projectSlug = route.params.project as string;
    if (!workspaceSlug || !projectSlug) return;

    try {
      const templates = await getPropertyTemplates(workspaceSlug, projectSlug);
      propertyOptions.value = (Array.isArray(templates) ? templates : [])
        .filter((t) => t?.id && t?.name)
        .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
        .map((t) => ({
          value: `${PROPERTY_GROUP_BY_PREFIX}${t.id}`,
          label: `Параметр: ${t.name}`,
        }));
    } catch (e) {
      // Ошибка загрузки шаблонов не должна ломать страницу —
      // просто остаёмся без опций группировки по параметрам
      console.error(
        'Не удалось загрузить шаблоны параметров для группировки',
        e,
      );
    }
  };

  onMounted(() => {
    setOptionsGroupForKanban();
    loadPropertyOptions();
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
