<template>
  <AdminHeader title="Пространства">
    <SearchInput v-model="searchQuery" />
  </AdminHeader>
  <WsTable :search-query="searchQuery" />
</template>

<script setup lang="ts">
import { ref } from 'vue';

import AdminHeader from '../ui/AdminHeader.vue';
import WsTable from './components/WsTable.vue';
import SearchInput from 'src/components/SearchInput.vue';

const searchQuery = ref<string | undefined>();
</script>
