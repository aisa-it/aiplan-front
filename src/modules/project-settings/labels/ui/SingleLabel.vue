<template>
  <div class="label row q-pa-md no-wrap">
    <div class="row no-wrap gap-x-4 overflow-hidden">
      <div class="circle" :style="`background-color: ${singleLabel.color}`" />
      <div class="overflow-hidden">
        <h6 class="font-medium q-ma-none word-wrap">{{ singleLabel.name }}</h6>
      </div>
    </div>

    <div class="buttons row no-wrap q-ml-auto">
      <q-btn dense flat @click="emits('edit', singleLabel)">
        <EditIcon />
        <HintTooltip> Редактировать </HintTooltip>
      </q-btn>

      <q-btn dense flat @click="emits('delete', singleLabel)">
        <BinIcon color="#DC3E3E" />
        <HintTooltip> Удалить </HintTooltip>
      </q-btn>
    </div>
  </div>
</template>
<script setup lang="ts">
import BinIcon from 'src/components/icons/BinIcon.vue';
import EditIcon from 'src/components/icons/EditIcon.vue';
import { DtoLabelLight } from '@aisa-it/aiplan-api-ts/src/data-contracts';

defineProps<{
  singleLabel: DtoLabelLight;
}>();

const emits = defineEmits<{
  edit: [value: DtoLabelLight];
  delete: [value: DtoLabelLight];
}>();

</script>
<style lang="scss" scoped>
.circle {
  min-width: 20px;
  width: 20px;
  height: 20px;
  border-radius: 100%;
}

.label {
  align-items: center;
  gap: 8px;

  h6 {
    font-size: 0.875rem;
    line-height: 1.25rem;
    margin: 0 !important;
  }
  span,
  p {
    font-size: 0.75rem;
    line-height: 1rem;
    color: $dark;
  }
}
.q-space {
  min-width: none;
}
.set-by-default {
  opacity: 0;
}
.set-by-default:hover {
  opacity: 1;
  cursor: pointer;
}

.abbriviatedText {
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
