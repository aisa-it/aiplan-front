<template>
  <q-select
    dense
    multiple
    options-dense
    label="Фильтр по статусу"
    clearable
    class="base-selector"
    popup-content-class="fit-select-popup scrollable-content inh-popup"
    map-options
    :model-value="statesSelect"
    :options="getStatusesAsArray"
    :option-label="(state) => state.name || 'Не выбран'"
    :option-value="(state) => state.id || null"
    @update:model-value="onUpdate"
  >
    <template v-slot:option="scope">
      <q-item v-bind="scope.itemProps">
        <q-item-section>
          <q-item-label class="fit-select-popup__item-label">
            <q-badge
              rounded
              class="q-mr-sm"
              :style="'background-color: ' + scope.opt.color"
            />
            <span class="word-wrap">{{ scope.opt.name }}</span>
          </q-item-label>
        </q-item-section>
      </q-item>
    </template>
  </q-select>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue';
import { useStatesStore } from 'src/stores/states-store';
import { useViewPropsStore } from 'src/stores/view-props-store';
import { IState } from 'src/interfaces/states';
import { storeToRefs } from 'pinia';
import { useProjectStore } from 'src/stores/project-store';

const emits = defineEmits(['update']);
const props = defineProps(['projectId']);

const viewProps = useViewPropsStore();
const statesStore = useStatesStore();
const { projectProps, getStatusesAsArray } = storeToRefs(useProjectStore());

const statesSelect = computed(() =>
  getStatusesAsArray.value.filter((state) => {
    if (!projectProps.value?.filters?.states) {
      projectProps.value.filters.states = [];
      return false;
    }
    return projectProps.value?.filters?.states.some((s) => s === state.id);
  }),
);
const states = ref([]);

const onUpdate = (states: IState[] | undefined) => {
  if (!states) {
    projectProps.value.filters.states = [];
  } else {
    projectProps.value.filters.states = states.map((state) => state.id);
  }
  emits('update');
};
</script>
