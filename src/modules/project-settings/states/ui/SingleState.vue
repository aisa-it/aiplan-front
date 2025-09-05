<template>
  <div class="state row q-px-md q-pb-md">
    <div class="centered-horisontally" style="width: 100%">
      <div class="circle" :style="`background-color: ${state.color}`" />
      <div :style="'margin: 0 16px; max-width: calc(100% - 60px);'">
        <h6 class="font-medium word-wrap">{{ stateRUS(state.name!) }}</h6>
        <HintTooltip>{{ stateRUS(state.name!) }}</HintTooltip>
      </div>
    </div>
    <span class="word-wrap" style="max-width: 100%">{{
      state.description
    }}</span>
    <div class="centered-horisontally justify-between" style="width: 100%">
      <div v-if="state.default">
        <span style="font-weight: 600">По умолчанию</span>
      </div>
      <div v-else @click="handleMakeDefault()" class="set-by-default">
        <span class="primary-link">Установить по умолчанию</span>
      </div>
      <div class="buttons row q-ml-sm no-wrap">
        <q-btn dense flat @click="emits('edit', state)">
          <EditIcon />
          <HintTooltip> Редактировать </HintTooltip>
        </q-btn>

        <div v-if="!state.default">
          <q-btn dense flat @click="emits('delete', state)">
            <BinIcon color="#DC3E3E" />
            <HintTooltip> Удалить </HintTooltip>
          </q-btn>
        </div>
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
  border-bottom: 1px solid $color-border-2;
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
