<template>
  <q-btn flat dense no-caps @click="popupToggle">
    <DotListIcon v-if="!isShowIndicators" :width="20" :height="20" />
    <DotListSelectIcon v-if="isShowIndicators" :width="20" :height="20" />
    <q-popup-proxy class="hide-scrollbar" @hide="isPopupOpen = false">
      <q-list style="width: 320px; background: white">
        <div v-show="projectView">
          <q-item-label header style="padding-bottom: 0px"
            >Отображение</q-item-label
          >
          <q-item v-show="projectView" class="row">
            <q-select
              dense
              label="Вид"
              v-model="viewSelector"
              class="base-selector full-w"
              popup-content-class="fit-select-popup scrollable-content selector-option__wrapper"
              :options="PROJECT_VIEWS"
              @update:model-value="onUpdate()"
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

          <q-item v-show="projectView" class="row">
            <q-select
              dense
              label="Колонки"
              v-model="columnsSelector"
              class="base-selector full-w"
              :options="columns"
              @update:model-value="onUpdate()"
              :option-label="(col) => col.label"
              :option-value="(col) => col.name"
              multiple
            >
              <template
                v-slot:option="{ itemProps, opt, selected, toggleOption }"
              >
                <q-item
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
            v-model="stateSelector"
            class="base-selector full-w"
            popup-content-class="fit-select-popup selector-option__wrapper scrollable-content"
            :options="options"
            @update:model-value="onUpdate()"
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
        <q-item v-show="projectView" class="row">
          <SelectStatusFilter
            :projectId="projectId"
            @update="onUpdate()"
            class="full-w"
          />
        </q-item>
        <q-item
          v-show="projectView"
          class="centered-horisontally justify-between"
        >
          Показывать подзадачи
          <q-toggle
            v-model="showSubIssues"
            size="32px"
            @update:model-value="onUpdate()"
          />
        </q-item>
        <q-item
          v-show="projectView"
          class="centered-horisontally justify-between"
        >
          Показывать черновики
          <q-toggle
            v-model="draft"
            size="32px"
            @update:model-value="onUpdate()"
          />
        </q-item>

        <q-item
          v-show="viewProps.props?.filters.group_by !== 'None'"
          class="centered-horisontally justify-between"
        >
          Показывать пустые группы
          <q-toggle
            v-model="showEmptyGroups"
            size="32px"
            @update:model-value="onUpdate()"
          />
        </q-item>

        <q-item class="centered-horisontally justify-between"
          >Только активные
          <q-toggle
            v-model="showOnlyActive"
            size="32px"
            @update:model-value="onUpdate()"
          />
        </q-item>
        <q-item class="centered-horisontally justify-between"
          >Я исполнитель
          <q-toggle
            v-model="assigneeToMe"
            size="32px"
            @update:model-value="onUpdate()"
          />
        </q-item>

        <q-item class="centered-horisontally justify-between"
          >Я наблюдатель
          <q-toggle
            v-model="watchedByMe"
            size="32px"
            @update:model-value="onUpdate()"
          />
        </q-item>

        <q-item class="centered-horisontally justify-between"
          >Я автор
          <q-toggle
            v-model="authoredByMe"
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
import { ref, onMounted, watch, computed } from 'vue';

// store
import { useViewPropsStore } from 'src/stores/view-props-store';

// constants
import { GROUP_BY_OPTIONS, PROJECT_VIEWS } from 'src/constants/constants';

// components
import DotListIcon from './icons/DotListIcon.vue';
import DotListSelectIcon from './icons/DotListSelectIcon.vue';
import SelectStatusFilter from './selects/SelectStatusFilter.vue';

const props = defineProps<{
  projectId: string;
  columns: any[];
}>();

const emits = defineEmits<{
  update: [];
}>();

const viewProps = useViewPropsStore();

const viewSelector = ref(PROJECT_VIEWS[0]);
const columnsSelector = ref(props.columns);
const showSubIssues = ref(false);
const draft = ref(false);
const showEmptyGroups = ref(false);
const showOnlyActive = ref(false);
const isPopupOpen = ref(false);

const projectView = !!props.projectId;
const assigneeToMe = ref(false);
const watchedByMe = ref(false);
const authoredByMe = ref(false);

const options = computed<{ value: string; label: string }[]>(() => {
  return viewSelector.value.value === 'list'
    ? GROUP_BY_OPTIONS
    : GROUP_BY_OPTIONS.filter((option) => option.value !== 'None');
});

const stateSelector = ref<{ value: string; label: string }>(options.value[0]);

const isShowIndicators = computed(() => {
  let isShow = false;
  const isNoGroupNone =
    viewProps.props?.filters.group_by !== GROUP_BY_OPTIONS[0].value;
  const isShowSubIssues = !viewProps.props?.showSubIssues;
  const isShowOnlyActive = viewProps.props?.showOnlyActive;
  const isStatusLength = !!viewProps.props?.filters.states?.length;
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

async function refresh() {
  viewProps.projectView = projectView;
  await viewProps.getProps().then((viewProps) => {
    stateSelector.value = options.value.find(
      (group) => group.value === viewProps?.filters.group_by,
    ) ?? options.value[0];
    viewSelector.value = PROJECT_VIEWS.find(
      (view) => view.value === viewProps?.issueView,
    ) || { value: 'list', label: 'Список' };

    if (!!viewProps?.columns_to_show && viewProps?.columns_to_show.length > 0) {
      columnsSelector.value = props.columns.filter((col) =>
        viewProps?.columns_to_show.some((c) => col.name == c),
      );
    }

    showSubIssues.value = viewProps?.showSubIssues;
    showEmptyGroups.value = viewProps?.showEmptyGroups;
    showOnlyActive.value = viewProps?.showOnlyActive;
    assigneeToMe.value = viewProps.filters.assigned_to_me || false;
    watchedByMe.value = viewProps.filters.watched_by_me || false;
    authoredByMe.value = viewProps.filters.authored_by_me || false;
  });
}

const popupToggle = () => {
  isPopupOpen.value = !isPopupOpen.value;
};

onMounted(async () => refresh());

const onUpdate = async () => {
  viewProps.props.issueView = viewSelector.value.value;
  viewProps.props.filters.group_by = stateSelector.value.value;
  viewProps.props.columns_to_show = columnsSelector.value.map(
    (col) => col.name,
  );
  viewProps.props.showSubIssues = showSubIssues.value;
  viewProps.props.showEmptyGroups = showEmptyGroups.value;
  viewProps.props.showOnlyActive = showOnlyActive.value;
  viewProps.props.draft = draft.value;
  viewProps.props.filters.assigned_to_me = assigneeToMe.value;
  viewProps.props.filters.watched_by_me = watchedByMe.value;
  viewProps.props.filters.authored_by_me = authoredByMe.value;

  await viewProps.saveProps().then(async () => {
    emits('update');
  });
};

watch(
  () => props.projectId,
  () => refresh(),
);

watch(
  () => viewProps.props.draft,
  () => {
    draft.value = viewProps.props.draft;
  },
  { immediate: true },
);

watch(
  () => viewSelector.value,
  () => {
    const isCurrentOptionAvailable = options.value.some(
      (opt) => opt.value === stateSelector.value.value,
    );

    if (!isCurrentOptionAvailable && options.value.length > 0) {
      stateSelector.value = options.value[0];
      onUpdate();
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
</style>
