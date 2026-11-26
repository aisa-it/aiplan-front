<template>
  <q-btn
    flat
    dense
    @click="isSearchOpened = true"
    class="btn-only-icon-sm"
    :class="isMobile ?  'q-mr-sm' : 'bordered'"
    data-tour="search"
  >
    <SearchIcon />
  </q-btn>
  <SearchByFiltersDialog  v-if="!isMobile" v-model="isSearchOpened" />
</template>
<script setup lang="ts">
//core
import { ref, onUnmounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';

//components
import SearchByFiltersDialog from 'src/modules/search-issues/ui/SearchByFiltersDialog.vue';
import SearchIcon from 'src/components/icons/SearchIcon.vue';

import { useFiltersStore } from 'src/modules/search-issues/stores/filters-store';
import { useAqlStore } from 'src/modules/search-issues/aql/stores/aql-store';

const filterStore = useFiltersStore();
const aqlStore = useAqlStore();

const props = defineProps<{
  isMobile?: boolean;
}>();

const isSearchOpened = ref(false);

const router = useRouter();

const removeHook = router.afterEach(() => {
  nextTick(() => {
    if (!!filterStore.filterIdFromRoute || aqlStore.queryFromRoute !== null) {
      isSearchOpened.value = true;
    }
  });
});

onUnmounted(() => {
  removeHook();
});
</script>
