<template>
  <div
    class="list-item q-pa-md q-mb-sm rounded-borders row items-center bordered-table"
  >
    <div class="q-mr-md cursor-pointer drag-handle">
      <q-icon name="drag_indicator" size="24px" color="grey" />
    </div>

    <div class="col">
      <div class="overflow-hidden">
        <h6
          class="font-medium q-ma-none word-wrap"
          style="margin: 0 !important"
        >
          {{ item.name }}
        </h6>
      </div>
      <div class="text-caption text-grey">
        {{ item.type ? formatType(item?.type) : '' }} |
        {{ item.only_admin ? 'Администраторы' : 'Все' }}
      </div>
    </div>

    <div class="buttons row no-wrap q-ml-auto">
      <q-btn dense flat @click="$emit('edit', item)">
        <EditIcon />
        <HintTooltip> Редактировать </HintTooltip>
      </q-btn>

      <q-btn dense flat @click="$emit('delete', item)">
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
  const typeMap: Record<string, string> = {
    string: 'Строка',
    boolean: 'Флаг',
    select: 'Список',
  };
  return typeMap[type] || type;
};
</script>
