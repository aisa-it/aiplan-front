<template>
  <q-td :props="rowInfo"
  >
    <div class="table-chip-wrap flex flex-center"
    >
      <QuantityChip :type="chipName" :value="rowInfo.value" />
    </div>
  </q-td>
</template>

<script setup lang="ts">
// components
import QuantityChip from 'src/components/QuantityChip.vue';

defineProps<{
  rowInfo: any;
  chipName: string;
}>();
</script>
