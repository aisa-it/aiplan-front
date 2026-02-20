<template>
  <q-btn flat dense no-caps @click="popupToggle">
    <DotListIcon
      v-if="!(isShowIndicators || isColumnsToShow)"
      :width="20"
      :height="20"
      data-tour="filter-list"
    />
    <DotListSelectIcon
      v-else
      :width="20"
      :height="20"
      data-tour="filter-list"
    />
    <q-popup-proxy
      ref="popupRef"
      class="hide-scrollbar"
      :persistent="guiderStore.activeGuid === 2"
      @hide="isPopupOpen = false"
    >
      <q-list style="width: 320px; background: white">
        <div>
          <div class="row items-center justify-between">
            <q-item-label header>Отображение</q-item-label>
            <q-btn
              flat
              dense
              class="q-mr-md btn-refresh"
              icon="refresh"
              @click="isConfirmResetDialogOpen = true"
              data-tour="refresh-filters"
            >
              <q-tooltip anchor="bottom middle" self="top middle"
                >Сбросить</q-tooltip
              >
            </q-btn>

            <q-dialog v-model="isConfirmResetDialogOpen">
              <q-card>
                <q-card-section class="text-body1">
                  Настройки отображения списка задач будут выставлены по
                  умолчанию. Продолжить?
                </q-card-section>
                <q-card-actions align="right">
                  <q-btn
                    no-caps
                    class="secondary-btn q-mr-xs"
                    style="width: 110px"
                    label="Отменить"
                    v-close-popup
                  />
                  <q-btn
                    flat
                    no-caps
                    label="Выполнить"
                    style="width: 110px"
                    class="primary-btn"
                    @click="onConfirmRefresh"
                  />
                </q-card-actions>
              </q-card>
            </q-dialog>
          </div>

          <q-item class="row" data-tour="view-options">
            <q-select
              dense
              label="Вид"
              v-model="viewForm.issueView"
              map-options
              class="base-selector full-w"
              popup-content-class="fit-select-popup scrollable-content selector-option__wrapper"
              :options="viewsOptionsFiltered"
              @update:model-value="updateIssueView"
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

          <q-item class="row" data-tour="columns-options">
            <FilterColumnsOptions
              v-model:columns-to-show="viewForm.columns_to_show"
              :columns="columns"
              @update:columns-to-show="onUpdate"
            />
          </q-item>
        </div>

        <q-item class="row" data-tour="group-options">
          <FilterGroupsOptions
            v-model:group_by="viewForm.filters.group_by"
            :options-group="optionsGroup"
            @update:group_by="onUpdate"
          />
        </q-item>

        <q-item class="row" data-tour="status-options">
          <SelectStatusFilter
            :statuses="statuses"
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

        <template v-for="toggle in toggles" :key="toggle.label">
          <q-item
            v-if="!toggle.notShow"
            class="centered-horisontally justify-between"
            :data-tour="toggle?.dataTour"
          >
            {{ toggle.label }}
            <q-toggle
              v-model="viewForm[toggle.model]"
              size="32px"
              @update:model-value="onUpdate"
            />
          </q-item>
        </template>

        <template v-for="toggle in filtersToggles" :key="toggle.label">
          <q-item
            v-show="!toggle.notShow"
            class="centered-horisontally justify-between"
            :data-tour="toggle?.dataTour"
          >
            {{ toggle.label }}
            <q-toggle
              v-model="viewForm.filters[toggle.model]"
              size="32px"
              @update:model-value="onUpdate"
            />
          </q-item>
        </template>
      </q-list>
    </q-popup-proxy>
  </q-btn>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import type { QPopupProxy } from 'quasar';

import DotListIcon from './icons/DotListIcon.vue';
import DotListSelectIcon from './icons/DotListSelectIcon.vue';
import SelectStatusFilter from './selects/SelectStatusFilter.vue';

import FilterColumnsOptions from './FilterColumnsOptions.vue';
import FilterGroupsOptions from './FilterGroupsOptions.vue';

import { useGuiderStore } from 'src/modules/guided-tours/guider-store';

const props = defineProps<{
  columns: any[];
  viewForm: any;
  optionsGroup: any;
  isShowIndicators: boolean;
  onUpdate: () => void;
  refreshFilters: () => void;
  updateIssueView: () => void;
  viewsOptions: any;
  toggles: any[];
  filtersToggles: any[];
  statuses: any[];
}>();

const q = useQuasar();

const isMobile = computed(() => q.platform.is.mobile);

const viewsOptionsFiltered = computed(() =>
  isMobile.value
    ? props.viewsOptions.filter((el) => !el.hideInMobile)
    : props.viewsOptions,
);

const popupRef = ref<QPopupProxy | null>(null);

const columnsSelector = ref(props.columns);

const isPopupOpen = ref(false);
const isConfirmResetDialogOpen = ref(false);

const isColumnsToShow = computed(() => {
  return props.columns.length !== columnsSelector.value.length;
});

const popupToggle = () => {
  isPopupOpen.value = !isPopupOpen.value;
};

const onConfirmRefresh = async () => {
  await props.refreshFilters();
  isConfirmResetDialogOpen.value = false;
};

onMounted(() => {
  if (
    isMobile.value &&
    !viewsOptionsFiltered.value.find(
      (el) => el.label === props.viewForm.issueView,
    )
  ) {
    props.viewForm.issueView = viewsOptionsFiltered.value[0];
    props.updateIssueView();
  }
});

const guiderStore = useGuiderStore();

watch(
  () => guiderStore.filtersListPopap,
  (val) => {
    if (val) {
      popupRef.value?.show();
      isPopupOpen.value = true;
    } else {
      popupRef.value?.hide();
      isPopupOpen.value = false;
    }
  },
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
