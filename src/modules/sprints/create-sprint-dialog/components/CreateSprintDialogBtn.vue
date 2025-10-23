<template>
  <q-btn
    flat
    dense
    style="margin-right: 5px"
    @click.stop.prevent="isSearchOpened = true"
  >
    <q-icon name="add" dense size="18px" />
  </q-btn>
  <CreateSprintDialog
    v-model="isSearchOpened"
    @update-sprints="emits('updateSprints')"
  />
</template>
<script setup lang="ts">
import { ref } from 'vue';
import CreateSprintDialog from '../CreateSprintDialog.vue';

const emits = defineEmits<{ updateSprints: [] }>();

const isSearchOpened = ref(false);
</script>
