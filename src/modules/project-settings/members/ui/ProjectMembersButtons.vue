<template>
  <div>
    <q-btn dense flat @click="emits('edit')">
      <EditIcon :width="18" :height="18" />
      <HintTooltip> Редактировать </HintTooltip>
    </q-btn>
    <q-btn v-if="props.showDelete" dense flat @click="emits('delete')">
      <BinIcon :width="18" :height="18" color="#DC3E3E"></BinIcon>
      <HintTooltip> Удалить </HintTooltip>
    </q-btn>
  </div>
</template>

<script lang="ts" setup>

// components
import BinIcon from 'src/components/icons/BinIcon.vue';
import EditIcon from 'src/components/icons/EditIcon.vue';

const props = withDefaults(
  defineProps<{
    showDelete: boolean;
  }>(),
  {
    showDelete: true,
  },
);

const emits = defineEmits(['edit', 'delete']);

</script>
