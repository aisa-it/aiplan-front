<template>
  <div class="col">
    <q-separator />

    <AdminHeader title="Пространства" flex>
      <SearchInput v-model="searchQuery" />
    </AdminHeader>

    <q-separator />

    <WsTable
      :userId="userId"
      :search-query="searchQuery"
      @select-row="(ws) => $emit('getWs', ws)"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

import AdminHeader from '../../ui/AdminHeader.vue';
import SearchInput from 'src/components/SearchInput.vue';
import WsTable from './WsTable.vue';

import { DtoWorkspace } from '@aisa-it/aiplan-api-ts/src/data-contracts';

defineProps<{ userId: string }>();
defineEmits<{ getWs: [ws: DtoWorkspace] }>();

const searchQuery = ref<string | undefined>();
</script>
