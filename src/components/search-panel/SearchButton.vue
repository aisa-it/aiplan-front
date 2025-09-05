<template>
  <q-btn
    flat
    dense
    @click="isSearchOpened = true"
    class="btn-only-icon-sm bordered"
  >
    <SearchIcon />
  </q-btn>
  <SearchByFiltersDialog v-model="isSearchOpened" />
</template>
<script setup lang="ts">
//core
import { ref } from 'vue';
//components
import SearchByFiltersDialog from 'src/modules/search-issues/ui/SearchByFiltersDialog.vue';
import SearchIcon from 'src/components/icons/SearchIcon.vue';

const isSearchOpened = ref(false);
</script>
