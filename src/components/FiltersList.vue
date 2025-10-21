<template>
  <q-btn flat dense no-caps @click="popupToggle">
    <DotListIcon v-if="!isShowIndicators" :width="20" :height="20" />
    <DotListSelectIcon v-if="isShowIndicators" :width="20" :height="20" />
    <q-popup-proxy class="hide-scrollbar" @hide="isPopupOpen = false">
      <q-list style="width: 320px; background: white">
        <div>
          <q-item-label header style="padding-bottom: 0px"
            >Отображение</q-item-label
          >
          <q-item class="row">
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

          <q-item class="row">
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
            v-model="groupSelector"
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
        <q-item class="row">
          <SelectStatusFilter
            :projectId="projectId"
            @update="onUpdate()"
            class="full-w"
          />
        </q-item>
        <q-item class="centered-horisontally justify-between">
          Показывать подзадачи
          <q-toggle
            v-model="showSubIssues"
            size="32px"
            @update:model-value="onUpdate()"
          />
        </q-item>
        <q-item class="centered-horisontally justify-between">
          Показывать черновики
          <q-toggle
            v-model="isDraft"
            size="32px"
            @update:model-value="onUpdate()"
          />
        </q-item>

        <q-item
          v-show="projectProps?.filters?.group_by !== 'None'"
          class="centered-horisontally justify-between"
        >
          Показывать пустые группы
          <q-toggle
            v-model="isShowEmptyGroups"
            size="32px"
            @update:model-value="onUpdate()"
          />
        </q-item>

        <q-item class="centered-horisontally justify-between"
          >Только активные
          <q-toggle
            v-model="isShowOnlyActive"
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
import { ref, onMounted, watch, computed, inject } from 'vue';
import { useRoute } from 'vue-router';
import { EventBus } from 'quasar';

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
import { useIssuesStore } from 'src/stores/issues-store';

const props = defineProps<{
  projectId: string;
  columns: any[];
}>();

const emits = defineEmits(['update']);

const route = useRoute();
const projectStore = useProjectStore();
const { projectProps, issuesLoader } = storeToRefs(projectStore);
const bus = inject('bus') as EventBus;

const viewSelector = ref();
const columnsSelector = ref(props.columns);
const groupSelector = ref();
const isDraft = ref();
const isShowEmptyGroups = ref();
const isShowOnlyActive = ref();
const showSubIssues = ref(false);
const draft = ref(false);
const isPopupOpen = ref(false);

const options = ref(NEW_GROUP_BY_OPTIONS);

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
    let props = JSON.parse(JSON.stringify(projectProps.value));
    props.issueView = viewSelector.value.value;
    props.filters.group_by = groupSelector.value.value;
    props.columns_to_show = columnsSelector.value.map((col) => col.name);
    props.showSubIssues = showSubIssues.value;
    props.showOnlyActive = isShowOnlyActive.value;
    props.showEmptyGroups = isShowEmptyGroups.value;
    props.draft = isDraft.value;

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
        emits('update', projectProps.value?.filters?.group_by);
      });
  } catch (e) {
    console.error(e);
  }
};
watch(
  () => projectProps.value,
  () => {
    viewSelector.value =
      PROJECT_VIEWS.find(
        (view) => view.value === projectProps.value?.issueView,
      ) || PROJECT_VIEWS[0];

    groupSelector.value =
      PARSED_GROUP[projectProps.value?.filters?.group_by || 'None'] ||
      NEW_GROUP_BY_OPTIONS.find(
        (option) => option.value === projectProps.value?.filters?.group_by,
      );

    showSubIssues.value = projectProps.value?.showSubIssues || false;
    isDraft.value = projectProps.value?.draft || true;
    isShowEmptyGroups.value = projectProps.value?.showEmptyGroups || false;
    isShowOnlyActive.value = projectProps.value?.showOnlyActive || false;
  },
);

watch(
  () => projectProps.value?.draft,
  () => {
    draft.value = projectProps.value?.draft;
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
