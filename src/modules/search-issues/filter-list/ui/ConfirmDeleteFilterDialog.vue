<template>
  <q-dialog ref="dialogRef">
    <q-card class="inner-modal-card">
      <q-card-section class="column q-pt-none">
        <h6 class="q-mb-sm q-mt-sm" style="font-weight: 600">
          Удаление фильтра
        </h6>
        <p>
          Вы действительно хотите удалить фильтр "<b> {{ filter?.name }} </b>"?
        </p>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn no-caps class="secondary-btn" @click="dialogRef.hide()">
          Отмена
        </q-btn>
        <q-btn
          no-caps
          class="delete-btn"
          @click="handleDeleteMyFilter(filter?.id as string)"
        >
          Удалить
        </q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
// core
import { ref } from 'vue';

// stores
import { useFiltersStore } from 'src/modules/search-issues/stores/filters-store';

// interfaces
import { DtoSearchFilterFull } from '@aisa-it/aiplan-api-ts/src/data-contracts';

//services
import { deleteFilter } from '../services/api';
import { getFilters, getMyFilters } from '../../services/api';

const props = defineProps<{
  filter: DtoSearchFilterFull;
  currentFilter: string;
}>();

const emits = defineEmits<{
  resetByDelete: [];
}>();

const filterStore = useFiltersStore();
const dialogRef = ref();

const handleDeleteMyFilter = async (filter_id: string) => {
  await deleteFilter(filter_id).then(async () => {
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
