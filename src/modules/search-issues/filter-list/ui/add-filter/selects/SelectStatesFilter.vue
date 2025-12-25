<template>
  <q-select
    :model-value="model"
    dense
    multiple
    clearable
    map-options
    emit-value
    :loading="loading"
    :options="groupedOptions"
    option-value="id"
    option-label="name"
    :popup-content-style="popupContentStyle"
    :label="label"
    popup-content-class="inh-popup scrollable-content"
    menu-anchor="top left"
    menu-self="bottom left"
    class="base-selector q-mb-sm"
    @update:model-value="onUpdate"
  >
    <template #option="scope">
      <div @click.stop v-bind="scope.itemProps" style="padding: 0px">
        <GroupList
          :label="scope.opt.label"
          :options="scope.opt.options"
          :selected="modelValue"
          @select="updateSelected"
        />
      </div>
    </template>

    <template #selected>
      <div v-if="modelValue.length" class="abbriviated-text">
        <template v-for="(id, index) in modelValue" :key="id">
          <span
            :class="{
              'error-text': !props.options.find((w) => w?.id === id)?.name,
            }"
          >
            {{
              props.options.find((w) => w?.id === id)?.name ?? unavailableText
            }}
          </span>
          <span v-if="index < modelValue.length - 1">, </span>
        </template>
      </div>
      <div v-if="props.onlyActive">
        <span>Только активные</span>
      </div>
    </template>

    <template #before-options>
      <div class="input-search-tags">
        <q-input
          v-model="search"
          label="Поиск"
          clearable
          dense
          class="base-input q-mb-sm"
          @update:model-value="(val) => emit('search', val?.toString())"
        />
      </div>
      <q-checkbox
        label="Только активные"
        :model-value="props.onlyActive"
        @update:model-value="(val) => emit('setOnlyActive', val)"
      />
    </template>

    <template #no-option>
      <div class="input-search-tags">
        <q-input
          v-model="search"
          label="Поиск"
          clearable
          dense
          class="base-input q-mb-sm"
          @update:model-value="(val) => emit('search', val?.toString())"
        />
      </div>
      <q-checkbox
        label="Только активные"
        :model-value="props.onlyActive"
        @update:model-value="(val) => emit('setOnlyActive', val)"
      />
      <q-item>
        <q-item-section>Нет статусов</q-item-section>
      </q-item>
    </template>
  </q-select>
</template>

<script setup lang="ts">
import GroupList from 'src/components/selects/components/GroupList.vue';
import { computed, ref, watch } from 'vue';

const props = defineProps<{
  modelValue: string[];
  options: any[];
  projects: any[];
  searchedOptions?: any[] | null;
  loading: boolean;
  popupContentStyle?: string;
  label: string;
  search: string;
  unavailableText?: string;
  onlyActive: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [val: string[]];
  search: [val?: string];
  setOnlyActive: [val: boolean, resetStates?: boolean];
}>();

const search = ref(props.search);

const model = computed(() =>
  props.modelValue.length
    ? [...props.modelValue]
    : props.onlyActive
      ? 'Только активные'
      : [],
);

const source = computed(() => props.searchedOptions ?? props.options);

const groupedOptions = computed(() => {
  const groups = source.value.reduce(
    (acc: Record<string, any>, status: any) => {
      if (!acc[status.project]) acc[status.project] = [];
      acc[status.project].push({
        label: status.name,
        value: status,
      });
      return acc;
    },
    {},
  );

  return Object.entries(groups).map(([projectId, options]) => {
    const label = props.projects.find((el) => el.id === projectId)?.name ?? '—';
    return {
      label,
      options,
    };
  });
});

const updateSelected = (option: any) => {
  emit('setOnlyActive', false);
  const id = option.value.id;
  const index = props.modelValue.findIndex((val) => val === id);
  const newValue = [...props.modelValue];

  if (index === -1) newValue.push(id);
  else newValue.splice(index, 1);

  emit('update:modelValue', newValue);
};

watch(
  () => props.search,
  (val) => {
    search.value = val;
  },
);

const onUpdate = (val: any[] | null) => {
  if (!val) {
    emit('setOnlyActive', false, true);
    return;
  }
  const normalized = val ? val.map((el) => el?.id ?? el) : [];
  emit('update:modelValue', normalized);
};
</script>
