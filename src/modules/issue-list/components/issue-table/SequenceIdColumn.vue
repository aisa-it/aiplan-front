<template>
  <q-td
    :props="rowInfo"
    class="sequence_id-column"
  >
    {{ rowInfo?.value[0] }}-{{ rowInfo?.value[1] }}
  </q-td>
</template>

<script setup lang="ts">

defineProps<{
  rowInfo: any;
}>();

</script>
<style scoped lang="scss">
   .sequence_id-column {
    font-size: 12px;
    padding: 7px 4px;
    cursor: pointer;
    white-space: pre-wrap;
    overflow-wrap: normal;

    @media screen and (max-width: 600px) {
      overflow-wrap: break-word;
      word-wrap: break-word;
    }
  }
</style>
