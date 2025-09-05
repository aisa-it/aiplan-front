<template>
  <div class="col">
    <q-separator />

    <AdminHeader title="Проекты" flex>
      <SearchInput v-model="searchQuery" />
    </AdminHeader>

    <q-separator />

    <ProjectTable :user-id="userId" :ws="ws" :search-query="searchQuery" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

import AdminHeader from '../../ui/AdminHeader.vue';
import SearchInput from 'src/components/SearchInput.vue';
import ProjectTable from './ProjectTable.vue';

import { DtoWorkspace } from '@aisa-it/aiplan-api-ts/src/data-contracts';

defineProps<{ userId: string; ws?: DtoWorkspace }>();

const searchQuery = ref<string | undefined>();
</script>
