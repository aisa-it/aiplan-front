<template>
  <div>
    <q-btn dense flat @click="emits('edit')" data-id="edit-member-button">
      <EditIcon :width="18" :height="18" />

      <HintTooltip> Редактировать </HintTooltip>
    </q-btn>

    <q-btn
      v-if="props.showDelete"
      dense
      flat
      @click="emits('delete')"
      data-id="delete-member-button"
    >
      <BinIcon :width="18" :height="18" color="#DC3E3E"></BinIcon>
      <HintTooltip> Удалить </HintTooltip>
    </q-btn>
  </div>
</template>

<script setup lang="ts">
import BinIcon from '../icons/BinIcon.vue';
import EditIcon from '../icons/EditIcon.vue';

const props = withDefaults(
  defineProps<{
    isActive: boolean;
    showDelete: boolean;
  }>(),
  {
    isActive: true,
    showDelete: true,
  },
);

const emits = defineEmits<{ edit: []; delete: [] }>();
</script>
