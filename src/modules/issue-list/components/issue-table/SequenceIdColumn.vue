<template>
  <q-td
    :props="rowInfo"
    :style="`font-size: 12px; padding: 7px 4px; cursor: pointer;`"
  >
    {{ rowInfo?.value[0] }}-{{ rowInfo?.value[1] }}
  </q-td>
</template>

<script setup lang="ts">

defineProps<{
  rowInfo: any;
}>();

</script>
