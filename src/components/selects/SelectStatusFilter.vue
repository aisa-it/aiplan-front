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
    :options="states"
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

<script lang="ts">
import { ref, defineComponent, onMounted, computed } from 'vue';
import { useStatesStore } from 'src/stores/states-store';
import { useViewPropsStore } from 'src/stores/view-props-store';
import { IState } from 'src/interfaces/states';

export default defineComponent({
  name: 'SelectStatusFilter',
  props: ['projectId'],
  emits: ['update'],
  setup(props, { emit }) {
    const viewProps = useViewPropsStore();
    const statesStore = useStatesStore();

    const statesSelect = computed(() =>
      states.value.filter((state) => {
        if (!viewProps.props.filters.states) {
          viewProps.props.filters.states = [];
          return false;
        }
        return viewProps.props.filters.states.some((s) => s === state.id);
      }),
    );
    const states = ref([]);

    const onUpdate = (states: IState[] | undefined) => {
      if (!states) {
        viewProps.props.filters.states = [];
      } else {
        viewProps.props.filters.states = states.map((state) => state.id);
      }
      emit('update');
    };

    onMounted(async () => {
      statesStore
        .getStatesList(props.projectId as string, false)
        .then((statesList) => (states.value = statesList));
    });

    return {
      states,
      statesSelect,
      viewProps,
      onUpdate,
    };
  },
});
</script>
