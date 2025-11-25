<template>
  <q-btn flat dense no-caps @click="popupToggle">
    <DotListIcon
      v-if="!(isShowIndicators || isColumnsToShow)"
      :width="20"
      :height="20"
    />
    <DotListSelectIcon v-else :width="20" :height="20" />
    <q-popup-proxy class="hide-scrollbar" @hide="isPopupOpen = false">
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
              :options="viewsOptions"
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
              @update:model-value="onUpdate"
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
            :options="optionsGroup"
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
            :statuses="statuses"
            :states-props="viewForm.filters.states || []"
            @update="
              (states) => {
                console.log(states);
                viewForm.filters.states = states;
                onUpdate();
              }
            "
            class="full-w"
          />
        </q-item>

        <template v-for="toggle in toggles" :key="toggle.label">
          <q-item
            v-show="!toggle.notShow"
            class="centered-horisontally justify-between"
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
import { ref, computed } from 'vue';

import DotListIcon from './icons/DotListIcon.vue';
import DotListSelectIcon from './icons/DotListSelectIcon.vue';
import SelectStatusFilter from './selects/SelectStatusFilter.vue';

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

const emits = defineEmits(['update']);

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
