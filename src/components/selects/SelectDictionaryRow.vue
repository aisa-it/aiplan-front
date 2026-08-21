<template>
  <q-select
    dense
    clearable
    emit-value
    map-options
    class="base-selector"
    :label="label || undefined"
    :model-value="modelValue"
    :options="options"
    :loading="isLoading"
    :virtual-scroll-slice-ratio-before="30"
    @update:model-value="handleUpdate"
    @popup-show="onPopupShow"
    @virtual-scroll="loadMoreOnScroll"
  >
    <template v-slot:before-options>
      <div class="select-search">
        <q-input
          style="padding: 8px"
          clearable
          dense
          autofocus
          label="Поиск"
          class="base-input"
          v-model="searchQuery"
          @update:model-value="(query) => searchRows(query as string)"
        />
        <q-separator />
      </div>
    </template>
    <template v-slot:no-option>
      <div class="select-search">
        <q-input
          style="padding: 8px"
          dense
          clearable
          autofocus
          label="Поиск"
          class="base-input"
          v-model="searchQuery"
          @update:model-value="(query) => searchRows(query as string)"
        />
      </div>
      <q-separator />
      <q-item class="items-center">Нет строк</q-item>
    </template>
  </q-select>
</template>

<script setup lang="ts">
//core
import { computed, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { debounce } from 'quasar';

//stores
import { useProjectStore } from 'src/stores/project-store';
import { useWorkspaceStore } from 'src/stores/workspace-store';

//services
import { getDictionaryRows } from 'src/modules/project-settings/dictionaries/services/api';

const props = withDefaults(
  defineProps<{
    dictionaryId: string;
    modelValue?: string | null;
    currentLabel?: string | null;
    label?: string;
  }>(),
  {
    modelValue: null,
    currentLabel: null,
    label: '',
  },
);

const emits = defineEmits<{
  (e: 'update:modelValue', value: string | null): void;
}>();

//stores
const projectStore = useProjectStore();
const workspaceStore = useWorkspaceStore();
const { currentProjectID } = storeToRefs(projectStore);
const { currentWorkspaceSlug } = storeToRefs(workspaceStore);

//variables
const rows = ref<{ label: string; value: string }[]>([]);
const countRows = ref(0);
const isLoading = ref(false);
const searchQuery = ref('');

const pagination = {
  offset: 0,
  limit: 50,
};

//computeds
// текущее значение (value_label) всегда подмешивается первой опцией,
// чтобы архивная строка продолжала отображаться
const options = computed(() => {
  const currentOption =
    props.modelValue && props.currentLabel
      ? [{ label: props.currentLabel, value: props.modelValue }]
      : [];

  return [...currentOption, ...rows.value].filter(
    (item, idx, arr) =>
      arr.findIndex((v) => v.value === item.value) === idx,
  );
});

//methods
const fetchRows = async (query?: string, isSearch?: boolean) => {
  if (!props.dictionaryId) return;

  isLoading.value = true;
  try {
    const res = await getDictionaryRows(
      currentWorkspaceSlug.value as string,
      currentProjectID.value,
      props.dictionaryId,
      {
        offset: pagination.offset,
        limit: pagination.limit,
        search_query: query || undefined,
      },
    );

    if (isSearch) rows.value = [];

    countRows.value = res.count || 0;
    rows.value = [
      ...rows.value,
      ...(res.result || []).map((row) => ({
        label: row.value || '',
        value: row.id || '',
      })),
    ];
  } catch (e) {
    console.error(e);
  } finally {
    isLoading.value = false;
  }
};

const searchRows = debounce(async (query: string) => {
  pagination.offset = 0;
  await fetchRows(query, true);
}, 700);

const loadMoreOnScroll = async (e?: any) => {
  if (
    e?.direction === 'increase' &&
    e?.index !== 0 &&
    e.index === e.to &&
    e.to < countRows.value
  ) {
    pagination.offset = pagination.offset + pagination.limit;
    await fetchRows();
  }
};

const onPopupShow = () => {
  searchQuery.value = '';
  pagination.offset = 0;
  rows.value = [];
  fetchRows();
};

const handleUpdate = (value: string | null) => {
  emits('update:modelValue', value ?? null);
};

//lifecycle hooks
// строки грузим при открытии попапа (onPopupShow); тут — только сброс при смене справочника
watch(
  () => props.dictionaryId,
  () => {
    rows.value = [];
    pagination.offset = 0;
  },
);
</script>
