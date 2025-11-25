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
    if (!props.statesProps) return [];

    if (!Array.isArray(props.statuses[0]?.id)) return [...props.statesProps];

    return props.statuses.filter((el) =>
      el.id.some((id) => props.statesProps.includes(id)),
    );
  },
  set(val) {
    if (!val?.length) {
      emits('update', []);
      return;
    }

    const ids = Array.isArray(val[0].id)
      ? val.flatMap((s) => s.id as string[])
      : val.map((state) => state.id || state);

    emits('update', ids);
  },
});
</script>
