<template>
  <div class="multi-value">
    <div
      v-for="(row, index) in rows"
      :key="row.key"
      class="row items-center no-wrap q-mb-xs"
    >
      <q-select
        class="base-selector issue-selector col"
        :model-value="row.value"
        :options="optionsForRow(index)"
        dense
        emit-value
        map-options
        :disable="disable"
        @update:model-value="(val) => setRowValue(index, val)"
      />
      <q-btn
        icon="close"
        flat
        round
        dense
        size="sm"
        class="q-ml-xs"
        :disable="disable"
        @click="removeRow(index)"
      >
        <q-tooltip>Убрать значение</q-tooltip>
      </q-btn>
    </div>

    <q-btn
      flat
      dense
      no-caps
      icon="add"
      :label="rows.length ? 'Добавить значение' : 'Выбрать значение'"
      color="primary"
      :disable="disable || !canAdd"
      @click="addRow"
    >
      <q-tooltip v-if="!canAdd && unique && !disable">
        Все варианты уже выбраны
      </q-tooltip>
    </q-btn>
  </div>
</template>

<script setup lang="ts">
// Список значений параметра типа multiselect: каждая строка — q-select из общих
// options, кнопка «+» добавляет строку. Наружу уходит только массив заполненных
// значений (строка с не выбранным ещё вариантом — локальное состояние).
// При unique выбранные в других строках варианты из списка исключаются, и «+»
// блокируется, когда варианты кончились
import { computed, ref, watch } from 'vue';

interface ValueRow {
  key: number;
  value: string | null;
}

const props = defineProps<{
  modelValue: string[] | null | undefined;
  options: string[];
  /** Значения не должны повторяться (настройка шаблона unique_values) */
  unique?: boolean;
  disable?: boolean;
}>();

const emits = defineEmits<{
  'update:modelValue': [value: string[]];
}>();

let rowKey = 0;
const nextKey = () => ++rowKey;

const rows = ref<ValueRow[]>([]);

const filledValues = () =>
  rows.value.map((row) => row.value).filter((val): val is string => !!val);

// пересборка строк из внешнего значения — только если оно реально отличается
// от заполненных строк (иначе затрём ещё не выбранную строку после «+»)
const syncFromModel = () => {
  const external = Array.isArray(props.modelValue)
    ? props.modelValue.filter(Boolean)
    : [];
  const current = filledValues();
  if (
    external.length === current.length &&
    external.every((val, i) => val === current[i])
  ) {
    return;
  }
  rows.value = external.map((value) => ({ key: nextKey(), value }));
};

watch(() => props.modelValue, syncFromModel, { immediate: true, deep: true });

const canAdd = computed(() => {
  // одна незаполненная строка за раз — иначе плодятся пустые селекты
  if (rows.value.some((row) => !row.value)) return false;
  if (!props.unique) return true;
  return filledValues().length < props.options.length;
});

// при unique из вариантов строки исключаем значения, выбранные в других строках
const optionsForRow = (index: number) => {
  if (!props.unique) return props.options;
  const used = new Set(
    rows.value.filter((_, i) => i !== index).map((row) => row.value),
  );
  return props.options.filter((opt) => !used.has(opt));
};

const emitValues = () => emits('update:modelValue', filledValues());

const addRow = () => {
  rows.value.push({ key: nextKey(), value: null });
};

const setRowValue = (index: number, val: string | null) => {
  rows.value[index].value = val;
  emitValues();
};

const removeRow = (index: number) => {
  const hadValue = !!rows.value[index].value;
  rows.value.splice(index, 1);
  if (hadValue) emitValues();
};
</script>

<style scoped lang="scss">
.issue-selector {
  max-width: 100%;
  min-width: 0;
}
</style>
