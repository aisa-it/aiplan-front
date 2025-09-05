<template>
  <q-select
    v-model="model"
    :label="label"
    :options="source"
    :option-value="'id'"
    :option-label="formatLabel"
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
            :class="{
              'error-text': !options.find((w) => w?.id === id),
            }"
          >
            {{
              options.find((w) => w?.id === id)
                ? formatLabel(options.find((w) => w?.id === id))
                : 'Пользователь недоступен'
            }}
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
          @update:model-value="(e) => emit('search', e?.toString())"
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
          @update:model-value="(e) => emit('search', e?.toString())"
        />
      </div>
      <q-item>
        <q-item-section> Нет пользователей </q-item-section>
      </q-item>
    </template>
  </q-select>
</template>

<script setup lang="ts">
import aiplan from 'src/utils/aiplan';
import { computed, ref, watch } from 'vue';

const props = defineProps<{
  modelValue: string[];
  label: string;
  searchedOptions: any[] | null;
  options: any[];
  loading?: boolean;
  popupContentStyle?: string | Record<string, any>;
  search?: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [val: string[]];
  search: [val?: string];
}>();

const model = ref([...props.modelValue]);
const searchValue = ref(props.search);

const source = computed(() => props.searchedOptions ?? props.options);

const onUpdate = (val: any[]) => {
  const ids = val ? val.map((el) => (el?.id ? el.id : el)) : [];
  emit('update:modelValue', ids);
};

const formatLabel = (member: any) => {
  return member &&
    typeof member === 'object' &&
    Array.isArray(aiplan.UserName(member))
    ? aiplan.UserName(member).join(' ')
    : 'Не Выбран';
};

watch(
  () => props.search,
  (val) => (searchValue.value = val),
);

watch(
  () => props.modelValue,
  (val) => (model.value = [...val]),
);
</script>
