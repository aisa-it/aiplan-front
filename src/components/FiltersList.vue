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
                  :class="{
                    'drag-before': dragOverItem === opt.name + '__before',
                    'drag-after': dragOverItem === opt.name + '__after',
                  }"
                  :draggable="$q.platform.is.desktop === true"
                  @dragstart="(e) => onDragStart(e, opt)"
                  @dragenter.prevent="(e) => onDragEnter(e, opt)"
                  @dragend="onDragEnd"
                  @dragover="(e) => onDragOver(e, opt)"
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

                  <q-item-section side v-if="$q.platform.is.desktop === true">
                    <q-icon name="drag_indicator" />
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

let draggedItem: any = null;
const dragOverItem = ref<string | null>(null);

const onDragStart = (event: DragEvent, item: any) => {
  draggedItem = item;
  event.dataTransfer?.setData('text/plain', item.name);
  event.dataTransfer!.effectAllowed = 'move';
};

const onDragEnter = (event: DragEvent, targetItem: any) => {
  event.preventDefault();

  if (!draggedItem || draggedItem === targetItem) return;

  dragOverItem.value = targetItem.name;
};

const onDragOver = (event: DragEvent, targetItem: any) => {
  event.preventDefault();

  const target = event.currentTarget as HTMLElement;
  const rect = target.getBoundingClientRect();

  const offset = event.clientY - rect.top;
  const half = rect.height / 2;

  if (offset > half) {
    dragOverItem.value = targetItem.name + '__after';
  } else {
    dragOverItem.value = targetItem.name + '__before';
  }
};

const onDragEnd = () => {
  if (!dragOverItem.value || !draggedItem) {
    draggedItem = null;
    return;
  }

  const arr = columnsSelector.value;

  const from = arr.findIndex((i) => i.name === draggedItem.name);

  const [targetName, position] = dragOverItem.value.split('__');
  let to = arr.findIndex((i) => i.name === targetName);

  if (position === 'after') {
    to += 1;
  }

  arr.splice(to, 0, arr.splice(from, 1)[0]);

  draggedItem = null;
  dragOverItem.value = null;

  const newOrder = arr.map((c) => c.name);
  props.viewForm.columns_to_show = newOrder.filter((name) =>
    props.viewForm.columns_to_show.includes(name),
  );

  props.onUpdate();
};

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
[draggable='true'] {
  cursor: grab;
}

.q-item.drag-over {
  background: #f0f0f0;
}

.drag-over {
  outline: 2px dashed #1976d2;
  border-radius: 6px;
}

.drag-before {
  border-top: 2px solid #1976d2;
}

.drag-after {
  border-bottom: 2px solid #1976d2;
}

.drag-before,
.drag-after {
  border-radius: 4px;
}

.selector-option-columns__wrapper {
  transition: transform 150ms ease;
}

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
