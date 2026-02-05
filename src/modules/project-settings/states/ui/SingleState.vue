<template>
  <div class="flex flex-column rounded-borders bordered-table q-pa-md">
    <div class="list-item row items-center full-w">
      <div class="q-mr-md cursor-pointer drag-handle">
        <q-icon name="drag_indicator" size="24px" color="grey" />
      </div>

      <div class="circle q-mr-md" :style="`background-color: ${state.color}`" />
      <div class="col">
        <div class="overflow-hidden">
          <h6 class="font-medium word-wrap" style="line-height: 18px">
            {{
              `${stateRUS(state.name!)} ${state.default === true ? '(По умолчанию)' : ''}`
            }}
          </h6>
          <!-- <HintTooltip>{{ stateRUS(state.name!) }}</HintTooltip> -->
        </div>
        <span class="word-wrap" style="max-width: 100%">{{
          state.description
        }}</span>
      </div>
      <div class="buttons row no-wrap q-ml-auto">
        <q-btn dense flat @click="emits('edit', state)">
          <EditIcon />
          <HintTooltip> Редактировать </HintTooltip>
        </q-btn>
        <q-btn dense flat @click="emits('delete', state)">
          <BinIcon color="#DC3E3E" />
          <HintTooltip> Удалить </HintTooltip>
        </q-btn>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// core
import { onUpdated, ref } from 'vue';
import { useRoute } from 'vue-router';

// utils
import { stateRUS } from 'src/utils/translator';

// interfaces
import { DtoStateLight } from '@aisa-it/aiplan-api-ts/src/data-contracts';

// components
import BinIcon from 'src/components/icons/BinIcon.vue';
import EditIcon from 'src/components/icons/EditIcon.vue';
import { updateState } from '../services/api';

const props = defineProps<{
  singleState: DtoStateLight;
  statesList: Record<string, DtoStateLight>;
}>();
const emits = defineEmits<{
  delete: [value: DtoStateLight];
  edit: [value: DtoStateLight];
  error: [];
  success: [value: string];
}>();

const route = useRoute();

const state = ref<DtoStateLight>(props.singleState);

onUpdated(() => (state.value = props.singleState));

const handleMakeDefault = async () => {
  await updateState(
    route.params.workspace as string,
    route.params.project as string,
    state.value.id as string,
    {
      default: true,
    },
  )
    .then(() => emits('success', `Статус "${state.value.name}" обновлен`))
    .catch(() => emits('error'));
};
</script>
<style lang="scss" scoped>
.circle {
  width: 20px;
  height: 20px;
  border-radius: 100%;
}

.state {
  border-bottom: 1px solid $dark-border-color;
  align-items: start;
  flex-direction: column;

  h6 {
    font-size: 0.875rem;
    line-height: 1.25rem;
    margin: 0;
  }

  span,
  p {
    font-size: 0.75rem;
    line-height: 1rem;
  }
}

.set-by-default {
  opacity: 1;
  cursor: pointer;
}

.abbriviatedText {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
