<template>
  <div class="aql-filters">
    <div class="aql-filters__buttons">
      <q-btn
        no-caps
        class="primary-btn full-w aql-filters__create"
        @click="isDialogOpen = true"
      >
        Создать фильтр
      </q-btn>
    </div>
    <div v-if="filters.length" class="aql-filters__list scrollable-content">
      <q-list>
        <q-item
          v-for="filter in filters"
          :key="filter.id"
          clickable
          class="aql-filters__item"
          @click="onSelect(filter)"
        >
          <span class="abbriviated-text aql-filters__name">{{
            filter.name
          }}</span>
          <q-btn
            flat
            dense
            class="aql-filters__copy"
            aria-label="Скопировать ссылку"
            :disable="!filter.aql?.trim()"
            @click.stop="copyAqlLink(filter.aql ?? '')"
          >
            <LinkIcon :width="16" :height="16" />
            <HintTooltip>Скопировать ссылку</HintTooltip>
          </q-btn>
          <q-btn
            flat
            dense
            class="aql-filters__edit"
            aria-label="Редактировать фильтр"
            @click.stop="onEdit(filter)"
          >
            <EditIcon :width="16" :height="16" />
            <HintTooltip>Редактировать фильтр</HintTooltip>
          </q-btn>
          <q-btn
            flat
            dense
            class="aql-filters__delete"
            :aria-label="deleteHint(filter)"
            @click.stop="onDelete(filter)"
          >
            <BinIcon color="#DC3E3E" :width="16" :height="16" />
            <HintTooltip>{{ deleteHint(filter) }}</HintTooltip>
          </q-btn>
        </q-item>
      </q-list>
    </div>
    <AqlFilterDialog
      v-model="isDialogOpen"
      :current-filter="filterToEdit"
      :initial-query="query"
      @hide="filterToEdit = null"
    />
    <ConfirmDeleteFilterDialog
      v-model="isDeletingOpen"
      :filter="filterToDelete"
      current-filter=""
    />
  </div>
</template>

<script setup lang="ts">
// core
import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';

// stores
import { useFiltersStore } from 'src/modules/search-issues/stores/filters-store';
import { useUserStore } from 'src/stores/user-store';

// components
import AqlFilterDialog from './AqlFilterDialog.vue';
import ConfirmDeleteFilterDialog from 'src/modules/search-issues/filter-list/ui/ConfirmDeleteFilterDialog.vue';
import BinIcon from 'src/components/icons/BinIcon.vue';
import EditIcon from 'src/components/icons/EditIcon.vue';
import LinkIcon from 'src/components/icons/LinkIcon.vue';

import { AqlFilter } from '../services/api';
import { useCopyAqlLink } from '../utils/copyLink';

defineProps<{
  // текст поля поиска: с него начинается новый фильтр
  query: string;
}>();

const emit = defineEmits<{
  select: [query: string];
}>();

const userStore = useUserStore();
const { myFilterList } = storeToRefs(useFiltersStore());

// старые фильтры тоже здесь: запрос для них собирает бэк
const filters = computed(() => myFilterList.value as AqlFilter[]);

const copyAqlLink = useCopyAqlLink();

const isDialogOpen = ref(false);
const isDeletingOpen = ref(false);
const filterToEdit = ref<AqlFilter | null>(null);
const filterToDelete = ref<AqlFilter>({});

const deleteHint = (filter: AqlFilter) =>
  !filter.author_id || filter.author_id === userStore.user?.id
    ? 'Удалить фильтр'
    : 'Убрать фильтр из своего списка';

const onSelect = (filter: AqlFilter) => {
  const query = filter.aql ?? '';
  if (query.trim()) emit('select', query);
};

const onEdit = (filter: AqlFilter) => {
  filterToEdit.value = filter;
  isDialogOpen.value = true;
};

const onDelete = (filter: AqlFilter) => {
  filterToDelete.value = filter;
  isDeletingOpen.value = true;
};
</script>

<style scoped lang="scss">
// колонка: высоту ограничивает родитель, прокручивается только список
.aql-filters {
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.aql-filters__buttons {
  flex-shrink: 0;
  padding: 10px 10px 8px 10px;
}

.aql-filters__list {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  padding: 0 2px 6px 2px;
}

.aql-filters__item {
  align-items: center;
  min-height: 0;
  padding: 2px 4px 2px 8px;
  border-radius: 8px;
}

.aql-filters__name {
  flex: 1 1 0;
  min-width: 0;
  font-size: 13px;
}
</style>
