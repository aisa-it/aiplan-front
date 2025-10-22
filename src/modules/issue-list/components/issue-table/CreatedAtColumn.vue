<template>
  <q-td :props="rowInfo">
    <span :style="'width: 150px; max-width: 150px'" class="body-2">
      {{ rowInfo.value }}
    </span>
  </q-td>
</template>

<script setup lang="ts">
defineProps<{
  rowInfo: any;
}>();
</script>
