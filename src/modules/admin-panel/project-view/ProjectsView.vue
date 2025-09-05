<template>
  <AdminHeader title="Проекты">
    <SearchInput v-model="searchQuery" />
  </AdminHeader>

  <ProjectsTable :search-query="searchQuery" />
</template>

<script setup lang="ts">
import { ref } from 'vue';

import AdminHeader from '../ui/AdminHeader.vue';
import SearchInput from 'src/components/SearchInput.vue';
import ProjectsTable from './components/ProjectsTable.vue';

const searchQuery = ref();
</script>
