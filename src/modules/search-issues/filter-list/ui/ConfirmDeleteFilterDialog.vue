<template>
  <q-dialog ref="dialogRef">
    <q-card class="inner-modal-card">
      <q-card-section class="column q-pt-none">
        <h6 class="q-mb-sm q-mt-sm" style="font-weight: 600">
          {{ isOwnFilter ? 'Удаление фильтра' : 'Удаление фильтра из списка' }}
        </h6>
        <p v-if="isOwnFilter">
          Вы действительно хотите удалить фильтр "<b> {{ filter?.name }} </b>"?
          Действие необратимо.
        </p>
        <p v-else>
          Вы действительно хотите убрать фильтр "<b> {{ filter?.name }} </b>" из
          своего списка? Фильтр останется в системе, его можно будет добавить
          снова.
        </p>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn
          no-caps
          class="secondary-btn"
          style="width: 100px"
          @click="dialogRef.hide()"
        >
          Отмена
        </q-btn>
        <q-btn
          no-caps
          class="delete-btn"
          style="width: 100px"
          @click="handleDeleteMyFilter(filter?.id as string)"
        >
          {{ isOwnFilter ? 'Удалить' : 'Убрать' }}
        </q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
// core
import { computed, ref } from 'vue';

// stores
import { useFiltersStore } from 'src/modules/search-issues/stores/filters-store';
import { useUserStore } from 'src/stores/user-store';

// interfaces
import { DtoSearchFilterFull } from '@aisa-it/aiplan-api-ts/src/data-contracts';

//services
import { deleteFilter, deleteMyFilter } from '../services/api';
import { getFilters, getMyFilters } from '../../services/api';

const props = defineProps<{
  filter: DtoSearchFilterFull;
  currentFilter: string;
}>();

const emits = defineEmits<{
  resetByDelete: [];
}>();

const filterStore = useFiltersStore();
const userStore = useUserStore();
const dialogRef = ref();

const isOwnFilter = computed(
  () =>
    !props.filter?.author_id || props.filter.author_id === userStore.user?.id,
);

const handleDeleteMyFilter = async (filter_id: string) => {
  const request = isOwnFilter.value ? deleteFilter : deleteMyFilter;
  await request(filter_id).then(async () => {
    if (props.filter.id === props.currentFilter) emits('resetByDelete');
    filterStore.myFilterList = await getMyFilters();
    filterStore.filterList = await getFilters();
    dialogRef.value.hide();
  });
};
</script>

<style scoped lang="scss">
.q-stepper {
  box-shadow: none;
}
</style>
