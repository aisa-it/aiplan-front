<template>
  <q-select
    v-model="model"
    :label="label"
    :options="source"
    :option-value="'id'"
    :option-label="'name'"
    :loading="loading"
    :popup-content-style="popupContentStyle"
    popup-content-class="inh-popup scrollable-content"
    class="base-selector q-mb-sm"
    dense
    multiple
    clearable
    emit-value
    map-options
    @update:model-value="onUpdate"
  >
    <template v-slot:selected>
      <div class="abbriviated-text">
        <template v-for="(id, index) in model" :key="id">
          <span
            :class="{ 'error-text': !options.find((w) => w?.id === id)?.name }"
          >
            {{ options.find((w) => w?.id === id)?.name ?? unavailableText }}
          </span>
          <span v-if="index < model.length - 1">, </span>
        </template>
      </div>
    </template>

    <template v-slot:before-options>
      <div class="input-search-tags">
        <q-input
          v-model="searchValue"
          label="Поиск"
          dense
          clearable
          class="base-input q-mb-sm"
          @update:model-value="(val) => emit('search', val?.toString())"
        />
      </div>
    </template>

    <template v-slot:no-option>
      <div class="input-search-tags">
        <q-input
          v-model="searchValue"
          label="Поиск"
          dense
          clearable
          class="base-input q-mb-sm"
          @update:model-value="(val) => emit('search', val?.toString())"
        />
      </div>
      <q-item>
        <q-item-section> Нет доступных элементов </q-item-section>
      </q-item>
    </template>
  </q-select>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';

const props = defineProps<{
  modelValue: string[];
  label: string;
  searchedOptions: any[] | null;
  options: { id: string; name: string }[];
  popupContentStyle?: string | Record<string, any>;
  loading?: boolean;
  search?: string;
  unavailableText?: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [val: string[]];
  search: [val?: string];
  update: [val: string[]];
}>();

const model = ref([...props.modelValue]);
const searchValue = ref(props.search);

const source = computed(() => props.searchedOptions ?? props.options);

watch(
  () => props.modelValue,
  (val) => {
    model.value = [...val];
  },
);

watch(
  () => props.search,
  (val) => {
    searchValue.value = val;
  },
);

const onUpdate = (val: any[]) => {
  const normalized = val ? val.map((el) => el?.id ?? el) : [];
  emit('update:modelValue', normalized);
  emit('update', normalized);
};
</script>
