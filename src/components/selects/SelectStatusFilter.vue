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
    v-model="states"
    :options="statuses"
    :option-label="(state) => state.name"
    :option-value="(state) => state.id"
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
import { computed } from 'vue';
import { IState } from 'src/interfaces/states';

const emits = defineEmits(['update']);
const props = defineProps(['statesProps', 'statuses']);

const states = computed<any[]>({
  get() {
    return props.statesProps || [];
  },
  set(val) {
    emits(
      'update',
      val?.length ? val.map((state: IState | any) => state.id ?? state) : [],
    );
  },
});
</script>
