<template>
  <q-btn
    flat
    dense
    @click="isSearchOpened = true"
    class="btn-only-icon-sm bordered"
    data-tour="search"
  >
    <SearchIcon />
  </q-btn>
  <SearchByFiltersDialog v-model="isSearchOpened" />
</template>
<script setup lang="ts">
//core
import { ref, onUnmounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';

//components
import SearchByFiltersDialog from 'src/modules/search-issues/ui/SearchByFiltersDialog.vue';
import SearchIcon from 'src/components/icons/SearchIcon.vue';

import { useFiltersStore } from 'src/modules/search-issues/stores/filters-store';

const filterStore = useFiltersStore();

const isSearchOpened = ref(false);

const router = useRouter();

const removeHook = router.afterEach(() => {
  nextTick(() => {
    if (!!filterStore.filterIdFromRoute) {
      isSearchOpened.value = true;
    }
  });
});

onUnmounted(() => {
  removeHook();
});
</script>
