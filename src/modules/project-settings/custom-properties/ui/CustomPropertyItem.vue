<template>
  <div
    class="list-item q-pa-sm q-mb-sm shadow-1 rounded-borders row items-center"
  >
    <div class="q-mr-md cursor-pointer drag-handle">
      <q-icon name="drag_indicator" size="24px" color="grey" />
    </div>

    <div class="col">
      <div class="text-subtitle1">{{ item.name }}</div>
      <div class="text-caption text-grey">
        {{ item.type ? formatType(item?.type) : '' }} |
        {{ item.only_admin ? 'Администраторы' : 'Все' }}
      </div>
    </div>

    <div class="q-gutter-sm">
      <q-btn flat round size="sm" color="primary" @click="$emit('edit', item)">
        <EditIcon />
        <HintTooltip> Редактировать </HintTooltip>
      </q-btn>
      <q-btn
        flat
        round
        size="sm"
        color="negative"
        @click="$emit('delete', item)"
      >
        <BinIcon color="#DC3E3E" />
        <HintTooltip> Удалить </HintTooltip>
      </q-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
//api
import { PropertyTemplate } from '../services/api';

//components
import EditIcon from 'src/components/icons/EditIcon.vue';
import BinIcon from 'src/components/icons/BinIcon.vue';
import HintTooltip from 'src/components/HintTooltip.vue';

defineProps<{
  item: PropertyTemplate;
}>();

defineEmits<{
  (e: 'edit', item: PropertyTemplate): void;
  (e: 'delete', item: PropertyTemplate): void;
}>();

//methods
const formatType = (type: string) => {
  return type === 'string' ? 'Строка' : 'Флаг';
};
</script>
