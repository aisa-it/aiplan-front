<template>
  <q-td :props="rowInfo">
    <span class="body-2" style="width: 150px; max-width: 150px">
      {{ sprintNames }}
    </span>
  </q-td>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  rowInfo: any;
}>();

const sprintNames = computed<string>(() => {
  return props.rowInfo.value
    ? props.rowInfo.value.map((sprint: any) => sprint.name).join(', ')
    : '';
});
</script>
