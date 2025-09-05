<template>
  <p class="q-mb-sm q-mt-sm">Выберите из списка или создайте новый</p>
  <q-list
    v-if="!loading && (myFilterList.length !== 0 || filterList.length !== 0)"
    style="height: 70vh !important; overflow-y: scroll"
    class="scrollable-content"
  >
    <q-item v-for="filter in filterList" :key="filter.id" clickable>
      <q-item-section class="no-wrap centered-horisontally">
        <q-radio
          v-model="filterToSave"
          dense
          :val="filter?.id"
          class="q-mr-sm"
          @update:model-value="
            () => {
              let tempFilter = filterList.find((el) => el.id == filterToSave);
              setFilter(tempFilter);
            }
          "
        />
        <span class="abbriviated-text">{{ filter?.name }}</span>

        <q-btn
          v-if="
            !myFilterList.find(
              (el: DtoSearchFilterFull) => el.id === filter?.id,
            )
          "
          flat
          dense
          @click="handleAddToMyFilters(filter?.id)"
        >
          <HintTooltip>Добавить фильтр в свой список</HintTooltip>

          <AddIcon :width="16" :height="16" />
        </q-btn>
        <q-btn
          v-if="
            myFilterList.find(
              (el: DtoSearchFilterFull) => el.id === filter?.id,
            ) && filter.author_id !== user.id
          "
          flat
          dense
          @click="handleDeleteFromMyFilters(filter?.id)"
        >
          <BinIcon color="#DC3E3E" :width="16" :height="16" />
          <HintTooltip>Удалить фильтр из своего списка</HintTooltip>
        </q-btn>
      </q-item-section>
    </q-item>
  </q-list>
  <div
    v-if="loading || (!loading && !myFilterList.length && !filterList.length)"
    class="column self-center justify-center"
    style="height: 90%"
  >
    <DefaultLoader v-if="loading" :size="2" unit="em" class="self-center" />
    <div
      v-if="!loading && !myFilterList.length && !filterList.length"
      class="self-center"
    >
      <h6>Нет фильтров</h6>
    </div>
  </div>
</template>

<script setup lang="ts">
// core
import { storeToRefs } from 'pinia';
import { ref } from 'vue';

// stores
import { useUserStore } from 'src/stores/user-store';
import { useFiltersStore } from 'src/modules/search-issues/stores/filters-store';

// components
import AddIcon from 'src/components/icons/AddIcon.vue';
import BinIcon from 'src/components/icons/BinIcon.vue';
import DefaultLoader from 'components/loaders/DefaultLoader.vue';
import {
  DtoSearchFilterFull,
  DtoSearchFilterLight,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';
import {
  getFilters,
  getMyFilters,
} from 'src/modules/search-issues/services/api';
import { addMyFilter, deleteMyFilter } from '../../services/api';

const emits = defineEmits<{
  setFilter: [filter: DtoSearchFilterLight];
}>();

// stores
const userStore = useUserStore();
const filterStore = useFiltersStore();
// stores to ref
const { user } = storeToRefs(userStore);
const { filterList } = storeToRefs(filterStore);
const { myFilterList } = storeToRefs(filterStore);
// vars
const loading = ref(false);
const filterToSave = ref();

const refresh = async () => {
  loading.value = true;

  Promise.allSettled([
    (filterStore.myFilterList = await getMyFilters()),
    (filterStore.filterList = await getFilters()),
  ]).then(() => (loading.value = false));
};

const setFilter = (filter?: DtoSearchFilterLight) => {
  if (!filter) return;
  emits('setFilter', filter);
};

const handleAddToMyFilters = async (filter_id?: string) => {
  if (!filter_id) return;
  await addMyFilter(filter_id).then(async () => {
    await refresh();
  });
};

const handleDeleteFromMyFilters = async (filter_id?: string) => {
  if (!filter_id) return;
  await deleteMyFilter(filter_id).then(async () => {
    await refresh();
  });
};
</script>
