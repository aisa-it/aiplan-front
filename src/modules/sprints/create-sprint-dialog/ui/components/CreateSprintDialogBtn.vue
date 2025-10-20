<template>
  <q-btn flat dense style="margin-right: 5px" @click="isSearchOpened = true">
    <q-icon name="add" dense size="18px" />
  </q-btn>
  <CreateSprintDialog v-model="isSearchOpened" />
</template>
<script setup lang="ts">
import { ref } from 'vue';
import CreateSprintDialog from '../CreateSprintDialog.vue';

const isSearchOpened = ref(false);
</script>
