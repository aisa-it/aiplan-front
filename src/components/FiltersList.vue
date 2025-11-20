<template>
  <q-btn flat dense no-caps @click="popupToggle">
    <DotListIcon v-if="!isShowIndicators" :width="20" :height="20" />
    <DotListSelectIcon v-if="isShowIndicators" :width="20" :height="20" />
    <q-popup-proxy class="hide-scrollbar" @hide="isPopupOpen = false">
      <q-list style="width: 320px; background: white">
        <div>
          <div
            style="
              display: flex;
              align-items: center;
              justify-content: space-between;
            "
          >
            <q-item-label header>Отображение</q-item-label>
            <q-btn
              flat
              dense
              class="q-mr-md btn-refresh"
              icon="refresh"
              @click="isConfirmResetDialogOpen = true"
            >
              <q-tooltip anchor="bottom middle" self="top middle"
                >Сбросить</q-tooltip
              >
            </q-btn>

            <q-dialog v-model="isConfirmResetDialogOpen">
              <q-card>
                <q-card-section class="text-body1">
                  Настройки отображения списка задач будут выставлены по умолчанию. Продолжить?
                </q-card-section>
                <q-card-actions align="right">
                  <q-btn
                    no-caps
                    class="secondary-btn q-mr-xs"
                    label="Отменить"
                    v-close-popup
                  />
                  <q-btn
                    flat
                    no-caps
                    label="Выполнить"
                    class="primary-btn"
                    @click="onConfirmRefresh"
                  />
                </q-card-actions>
              </q-card>
            </q-dialog>
          </div>
          <q-item class="row">
            <q-select
              dense
              label="Вид"
              v-model="viewForm.issueView"
              map-options
              class="base-selector full-w"
              popup-content-class="fit-select-popup scrollable-content selector-option__wrapper"
              :options="PROJECT_VIEWS"
              @update:model-value="
                () => {
                  updateIssueView();
                }
              "
            >
              <template v-slot:option="{ itemProps, opt }">
                <q-item v-bind="itemProps" class="selector-option__wrapper">
                  <q-item-section>
                    <q-item-label>
                      {{ opt.label }}
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
          </q-item>

          <q-item class="row">
            <q-select
              v-model="viewForm.columns_to_show"
              dense
              label="Колонки"
              class="base-selector full-w"
              multiple
              map-options
              :options="columns"
              :option-label="(col) => col.label"
              :option-value="(col) => col.name"
              @update:model-value="
                () => {
                  onUpdate();
                }
              "
            >
              <template
                v-slot:option="{ itemProps, opt, selected, toggleOption }"
              >
                <q-item
                  v-if="opt.name !== 'sequence_id'"
                  v-bind="itemProps"
                  class="selector-option__wrapper selector-option-columns__wrapper q-py-none"
                >
                  <q-item-section side>
                    <q-checkbox
                      :model-value="selected"
                      @update:model-value="toggleOption(opt)"
                    />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>
                      {{ opt.label }}
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
          </q-item>
        </div>

        <q-item class="row">
          <q-select
            dense
            label="Группировка"
            v-model="viewForm.filters.group_by"
            map-options
            class="base-selector full-w"
            popup-content-class="fit-select-popup selector-option__wrapper scrollable-content"
            :options="options"
            @update:model-value="
              () => {
                viewForm.filters.group_by = viewForm.filters.group_by.value;
                onUpdate();
              }
            "
          >
            <template v-slot:option="{ itemProps, opt }">
              <q-item v-bind="itemProps" class="selector-option__wrapper">
                <q-item-section>
                  <q-item-label>
                    {{ opt.label }}
                  </q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </q-select>
        </q-item>
        <q-item class="row">
          <SelectStatusFilter
            :projectId="projectId"
            :states-props="viewForm.filters.states || []"
            @update="
              (states) => {
                viewForm.filters.states = states;
                onUpdate();
              }
            "
            class="full-w"
          />
        </q-item>
        <q-item class="centered-horisontally justify-between">
          Показывать подзадачи
          <q-toggle
            v-model="viewForm.showSubIssues"
            size="32px"
            @update:model-value="onUpdate()"
          />
        </q-item>
        <q-item class="centered-horisontally justify-between">
          Показывать черновики
          <q-toggle
            v-model="viewForm.draft"
            size="32px"
            @update:model-value="onUpdate()"
          />
        </q-item>

        <q-item
          v-show="projectProps?.filters?.group_by !== 'none'"
          class="centered-horisontally justify-between"
        >
          Показывать пустые группы
          <q-toggle
            v-model="viewForm.showEmptyGroups"
            size="32px"
            @update:model-value="onUpdate()"
          />
        </q-item>

        <q-item class="centered-horisontally justify-between"
          >Только активные
          <q-toggle
            v-model="viewForm.showOnlyActive"
            size="32px"
            @update:model-value="onUpdate()"
          />
        </q-item>
        <q-item class="centered-horisontally justify-between">
          Я исполнитель
          <q-toggle
            v-model="viewForm.filters.assignedToMe"
            size="32px"
            @update:model-value="onUpdate()"
          />
        </q-item>
        <q-item class="centered-horisontally justify-between">
          Я наблюдатель
          <q-toggle
            v-model="viewForm.filters.watchedToMe"
            size="32px"
            @update:model-value="onUpdate()"
          />
        </q-item>
        <q-item class="centered-horisontally justify-between">
          Я автор
          <q-toggle
            v-model="viewForm.filters.authoredToMe"
            size="32px"
            @update:model-value="onUpdate()"
          />
        </q-item>
      </q-list>
    </q-popup-proxy>
  </q-btn>
</template>

<script setup lang="ts">
// core
import { ref, watch, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';

// store
import { useProjectStore } from 'src/stores/project-store';
// constants
import {
  GROUP_BY_OPTIONS,
  NEW_GROUP_BY_OPTIONS,
  PARSED_GROUP,
  PROJECT_VIEWS,
} from 'src/constants/constants';

// components
import DotListIcon from './icons/DotListIcon.vue';
import DotListSelectIcon from './icons/DotListSelectIcon.vue';
import SelectStatusFilter from './selects/SelectStatusFilter.vue';
import { storeToRefs } from 'pinia';
import { is } from 'quasar';
import { DEFAULT_VIEW_PROPS } from 'src/modules/issue-list/constants/defaultProps';

const props = defineProps<{
  projectId: string;
  columns: any[];
}>();

const emits = defineEmits(['update', 'readyToLoadIssues']);

const route = useRoute();
const projectStore = useProjectStore();
const { projectProps, issuesLoader } = storeToRefs(projectStore);

const viewForm = ref();

const columnsSelector = ref(props.columns);

const isPopupOpen = ref(false);
const options = ref(NEW_GROUP_BY_OPTIONS);

const defaultViewForm = ref(DEFAULT_VIEW_PROPS);
const isConfirmResetDialogOpen = ref(false);

const isShowIndicators = computed(() => {
  let isShow = false;
  const isNoGroupNone =
    projectProps?.value?.filters?.group_by !== GROUP_BY_OPTIONS[0].value;
  const isShowSubIssues = !projectProps?.value?.showSubIssues;
  const isShowOnlyActive = projectProps?.value?.showOnlyActive;
  const isStatusLength = !!projectProps.value?.filters.states?.length;
  const isColumnsToShow = props.columns.length !== columnsSelector.value.length;

  if (
    isShowSubIssues ||
    isShowOnlyActive ||
    isNoGroupNone ||
    isStatusLength ||
    isColumnsToShow
  ) {
    isShow = true;
  }
  return isShow;
});

const popupToggle = () => {
  isPopupOpen.value = !isPopupOpen.value;
};

const onUpdate = async () => {
  try {
    issuesLoader.value = true;
    // приводим поле columns_to_show к формату string[], иногда туда залетает объект
    viewForm.value.columns_to_show = viewForm.value.columns_to_show.map(
      (column) => column?.name || column,
    );

    let props = JSON.parse(JSON.stringify(viewForm.value));
    await projectStore.setProjectProps(
      route.params.workspace as string,
      route.params.project as string,
      props,
    );
    await projectStore
      .getMeInProject(
        route.params.workspace as string,
        route.params.project as string,
      )
      .then(() => {
        viewForm.value = JSON.parse(JSON.stringify(projectProps.value));
        emits('update', projectProps.value?.filters?.group_by);
      });
  } catch {
    issuesLoader.value = false;
  }
};

const refreshFilters = async () => {
  viewForm.value = DEFAULT_VIEW_PROPS;
  await onUpdate();
};

const onConfirmRefresh = async () => {
  await refreshFilters();
  isConfirmResetDialogOpen.value = false;
};

onMounted(() => {
  // если выбран канбан, то убираем возможность выбрать "Нет" в группировке

  if (viewForm.value.issueView === 'kanban') {
    options.value = options.value.filter((opt) => opt.value !== 'none');
  } else {
    options.value = NEW_GROUP_BY_OPTIONS;
  }
});

const updateIssueView = async () => {
  // разворачиваем объект, тк нужно только значение value
  viewForm.value.issueView = viewForm.value.issueView.value;

  // подменяем в сторе чтобы корректно отобразиоть скелетон
  projectProps.value.issueView = viewForm.value.issueView;

  // если выбран канбан, то убираем возможность выбрать "Нет" в группировке
  if (viewForm.value.issueView === 'kanban') {
    options.value = options.value.filter((opt) => opt.value !== 'none');

    if (viewForm.value.filters?.group_by === 'none') {
      viewForm.value.filters.group_by = options.value[0].value;
    }
  } else {
    options.value = NEW_GROUP_BY_OPTIONS;
  }

  await onUpdate();
};

// для обновления формы пропсов
watch(
  () => projectProps.value,
  () => {
    if (is.object(projectProps.value)) {
      viewForm.value = JSON.parse(JSON.stringify(projectProps.value));
      if (viewForm.value.issueView === 'kanban') {
        options.value = options.value.filter((opt) => opt.value !== 'none');
      } else {
        options.value = NEW_GROUP_BY_OPTIONS;
      }
    }
  },
  { immediate: true },
);
</script>

<style lang="scss" scoped>
.selector-option {
  &__wrapper {
    min-height: 40px;
  }

  &-columns__wrapper {
    padding-left: 12px;

    .q-item__section--side {
      padding-right: 12px;
    }
  }
}

.btn-refresh {
  color: $text-color;
}
</style>
